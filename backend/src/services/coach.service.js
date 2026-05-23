import prisma from '../config/database.js';
import { parsePagination, paginatedResponse } from '../utils/pagination.js';

export const createCoach = async (data) => {
  return prisma.coach.create({
    data,
    include: { gym: { select: { id: true, name: true } } },
  });
};

export const getCoachesByGym = async (gymId, query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const search = query.search || '';
  const isActive = query.isActive !== undefined ? query.isActive === 'true' : undefined;

  const where = {
    gymId,
    ...(isActive !== undefined && { isActive }),
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { specializations: { hasSome: [search] } },
      ],
    }),
  };

  const [coaches, total] = await Promise.all([
    prisma.coach.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.coach.count({ where }),
  ]);

  return paginatedResponse(coaches, total, page, limit);
};

export const getCoachById = async (id) => {
  const coach = await prisma.coach.findUnique({
    where: { id },
    include: {
      gym: { select: { id: true, name: true } },
      classSchedules: {
        include: {
          class: { select: { id: true, name: true, category: true } },
          facility: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!coach) {
    const error = new Error('Coach not found');
    error.statusCode = 404;
    throw error;
  }

  return coach;
};

export const updateCoach = async (id, data) => {
  return prisma.coach.update({ where: { id }, data });
};

export const deleteCoach = async (id) => {
  return prisma.coach.update({ where: { id }, data: { isActive: false } });
};
