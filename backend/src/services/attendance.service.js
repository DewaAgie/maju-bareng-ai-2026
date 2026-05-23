import prisma from '../config/database.js';
import { parsePagination, paginatedResponse } from '../utils/pagination.js';

export const checkIn = async ({ qrCode, barcodeValue, gymId }) => {
  // Find member by QR code or barcode
  const where = qrCode ? { qrCode } : { barcodeValue };
  const member = await prisma.member.findUnique({
    where,
    include: {
      memberMemberships: {
        where: { status: 'ACTIVE' },
        take: 1,
        orderBy: { createdAt: 'desc' },
        include: {
          membershipPlan: { select: { name: true } },
        },
      },
    },
  });

  if (!member) {
    const error = new Error('Member not found. Please check your QR code or barcode.');
    error.statusCode = 404;
    throw error;
  }

  if (!member.isActive) {
    const error = new Error('This member account is deactivated.');
    error.statusCode = 403;
    throw error;
  }

  if (member.gymId !== gymId) {
    const error = new Error('This member does not belong to this gym.');
    error.statusCode = 403;
    throw error;
  }

  // Check membership status
  const activeMembership = member.memberMemberships[0];
  if (!activeMembership) {
    const error = new Error('No active membership found. Please renew your membership.');
    error.statusCode = 403;
    throw error;
  }

  if (new Date(activeMembership.endDate) < new Date()) {
    // Update status to expired
    await prisma.memberMembership.update({
      where: { id: activeMembership.id },
      data: { status: 'EXPIRED' },
    });
    const error = new Error('Membership has expired. Please renew your membership.');
    error.statusCode = 403;
    throw error;
  }

  // Log attendance
  const method = qrCode ? 'QR_CODE' : barcodeValue ? 'BARCODE' : 'MANUAL';
  const log = await prisma.attendanceLog.create({
    data: {
      memberId: member.id,
      gymId,
      method,
    },
  });

  return {
    checkInId: log.id,
    memberName: member.fullName,
    memberAvatar: member.avatarUrl,
    membershipPlan: activeMembership.membershipPlan.name,
    membershipStatus: 'ACTIVE',
    membershipEndDate: activeMembership.endDate,
    checkInAt: log.checkInAt,
    method: log.method,
  };
};

export const getAttendanceLogs = async (gymId, query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const { startDate, endDate, memberId, method } = query;

  const where = {
    gymId,
    ...(memberId && { memberId }),
    ...(method && { method }),
    ...(startDate && endDate && {
      checkInAt: {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59.999Z'),
      },
    }),
  };

  const [logs, total] = await Promise.all([
    prisma.attendanceLog.findMany({
      where,
      skip,
      take,
      orderBy: { checkInAt: 'desc' },
      include: {
        member: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      },
    }),
    prisma.attendanceLog.count({ where }),
  ]);

  return paginatedResponse(logs, total, page, limit);
};

export const getTodayAttendance = async (gymId) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [count, logs] = await Promise.all([
    prisma.attendanceLog.count({
      where: {
        gymId,
        checkInAt: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.attendanceLog.findMany({
      where: {
        gymId,
        checkInAt: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { checkInAt: 'desc' },
      include: {
        member: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    }),
  ]);

  return { count, logs };
};

export const getMemberAttendance = async (memberId, query) => {
  const { skip, take, page, limit } = parsePagination(query);

  const [logs, total] = await Promise.all([
    prisma.attendanceLog.findMany({
      where: { memberId },
      skip,
      take,
      orderBy: { checkInAt: 'desc' },
    }),
    prisma.attendanceLog.count({ where: { memberId } }),
  ]);

  return paginatedResponse(logs, total, page, limit);
};
