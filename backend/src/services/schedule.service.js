import prisma from '../config/database.js';
import { parsePagination, paginatedResponse } from '../utils/pagination.js';

/**
 * Validate no time conflicts for the same facility + same dayOfWeek.
 */
const checkTimeConflict = async (facilityId, dayOfWeek, startTime, endTime, excludeId = null) => {
  const existingSchedules = await prisma.classSchedule.findMany({
    where: {
      facilityId,
      dayOfWeek,
      isActive: true,
      ...(excludeId && { id: { not: excludeId } }),
    },
  });

  for (const schedule of existingSchedules) {
    // Check for time overlap
    if (startTime < schedule.endTime && endTime > schedule.startTime) {
      const error = new Error(
        `Time conflict: This facility already has a class scheduled from ${schedule.startTime} to ${schedule.endTime} on ${dayOfWeek}`
      );
      error.statusCode = 409;
      throw error;
    }
  }
};

export const createSchedule = async (data) => {
  await checkTimeConflict(data.facilityId, data.dayOfWeek, data.startTime, data.endTime);

  return prisma.classSchedule.create({
    data,
    include: {
      class: { select: { id: true, name: true, category: true } },
      coach: { select: { id: true, fullName: true } },
      facility: { select: { id: true, name: true } },
    },
  });
};

export const getSchedules = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const { dayOfWeek, classId, coachId, facilityId, gymId } = query;

  const where = {
    isActive: true,
    ...(dayOfWeek && { dayOfWeek }),
    ...(classId && { classId }),
    ...(coachId && { coachId }),
    ...(facilityId && { facilityId }),
    ...(gymId && { class: { gymId } }),
  };

  const [schedules, total] = await Promise.all([
    prisma.classSchedule.findMany({
      where,
      skip,
      take,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      include: {
        class: { select: { id: true, name: true, category: true, durationMinutes: true, maxCapacity: true } },
        coach: { select: { id: true, fullName: true, avatarUrl: true } },
        facility: { select: { id: true, name: true, capacity: true } },
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.classSchedule.count({ where }),
  ]);

  return paginatedResponse(schedules, total, page, limit);
};

export const getWeeklySchedule = async (gymId) => {
  const schedules = await prisma.classSchedule.findMany({
    where: {
      class: { gymId },
      isActive: true,
    },
    orderBy: [{ startTime: 'asc' }],
    include: {
      class: { select: { id: true, name: true, category: true } },
      coach: { select: { id: true, fullName: true } },
      facility: { select: { id: true, name: true } },
      _count: { select: { enrollments: true } },
    },
  });

  // Group by day of week
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const weekly = {};
  days.forEach((day) => {
    weekly[day] = schedules.filter((s) => s.dayOfWeek === day);
  });

  return weekly;
};

export const getScheduleById = async (id) => {
  const schedule = await prisma.classSchedule.findUnique({
    where: { id },
    include: {
      class: true,
      coach: true,
      facility: true,
      enrollments: {
        include: { member: { select: { id: true, fullName: true, email: true } } },
      },
    },
  });

  if (!schedule) {
    const error = new Error('Schedule not found');
    error.statusCode = 404;
    throw error;
  }

  return schedule;
};

export const updateSchedule = async (id, data) => {
  if (data.facilityId && data.dayOfWeek && data.startTime && data.endTime) {
    await checkTimeConflict(data.facilityId, data.dayOfWeek, data.startTime, data.endTime, id);
  }

  return prisma.classSchedule.update({
    where: { id },
    data,
    include: {
      class: { select: { id: true, name: true } },
      coach: { select: { id: true, fullName: true } },
      facility: { select: { id: true, name: true } },
    },
  });
};

export const deleteSchedule = async (id) => {
  return prisma.classSchedule.update({ where: { id }, data: { isActive: false } });
};
