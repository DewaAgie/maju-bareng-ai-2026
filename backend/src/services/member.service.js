import prisma from '../config/database.js';
import { parsePagination, paginatedResponse } from '../utils/pagination.js';
import { generateQRCodeString, generateBarcodeValue } from '../utils/qr.js';
import { sendWelcomeEmail } from '../config/mailer.js';

export const createMember = async (data) => {
  const qrCode = generateQRCodeString();
  const barcodeValue = generateBarcodeValue();

  const member = await prisma.member.create({
    data: {
      ...data,
      qrCode,
      barcodeValue,
    },
  });

  // Send welcome email (non-blocking)
  sendWelcomeEmail(member).catch((err) => {
    console.error('Failed to send welcome email:', err.message);
  });

  return member;
};

export const getMembersByGym = async (gymId, query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const search = query.search || '';
  const membershipStatus = query.membershipStatus || '';
  const planId = query.planId || '';

  const where = {
    gymId,
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(membershipStatus && {
      memberMemberships: {
        some: { status: membershipStatus },
      },
    }),
    ...(planId && {
      memberMemberships: {
        some: { membershipPlanId: planId },
      },
    }),
  };

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        memberMemberships: {
          where: { status: 'ACTIVE' },
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            membershipPlan: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.member.count({ where }),
  ]);

  return paginatedResponse(members, total, page, limit);
};

export const getMemberById = async (id) => {
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      gym: { select: { id: true, name: true } },
      memberMemberships: {
        orderBy: { createdAt: 'desc' },
        include: {
          membershipPlan: {
            include: { benefits: true },
          },
        },
      },
      attendanceLogs: {
        take: 20,
        orderBy: { checkInAt: 'desc' },
      },
      classEnrollments: {
        where: { status: 'ACTIVE' },
        include: {
          schedule: {
            include: {
              class: { select: { id: true, name: true, category: true } },
              coach: { select: { id: true, fullName: true } },
              facility: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!member) {
    const error = new Error('Member not found');
    error.statusCode = 404;
    throw error;
  }

  return member;
};

export const updateMember = async (id, data) => {
  return prisma.member.update({ where: { id }, data });
};

export const deleteMember = async (id) => {
  return prisma.member.update({ where: { id }, data: { isActive: false } });
};

export const assignMembership = async (memberId, membershipPlanId, startDate) => {
  const plan = await prisma.membershipPlan.findUnique({
    where: { id: membershipPlanId },
  });

  if (!plan) {
    const error = new Error('Membership plan not found');
    error.statusCode = 404;
    throw error;
  }

  // Cancel any existing active membership
  await prisma.memberMembership.updateMany({
    where: { memberId, status: 'ACTIVE' },
    data: { status: 'CANCELLED' },
  });

  // Calculate end date
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + plan.durationDays);

  return prisma.memberMembership.create({
    data: {
      memberId,
      membershipPlanId,
      startDate: start,
      endDate: end,
      status: 'ACTIVE',
    },
    include: {
      membershipPlan: { select: { id: true, name: true, durationDays: true, price: true } },
    },
  });
};
