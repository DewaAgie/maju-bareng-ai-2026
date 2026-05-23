import prisma from '../config/database.js';
import { parsePagination, paginatedResponse } from '../utils/pagination.js';

export const createPlan = async (data) => {
  const { benefits, ...planData } = data;

  return prisma.membershipPlan.create({
    data: {
      ...planData,
      benefits: benefits?.length
        ? { create: benefits.map((b) => ({ description: b })) }
        : undefined,
    },
    include: { benefits: true },
  });
};

export const getPlansByGym = async (gymId, query) => {
  const { skip, take, page, limit } = parsePagination(query);

  const [plans, total] = await Promise.all([
    prisma.membershipPlan.findMany({
      where: { gymId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        benefits: true,
        _count: { select: { memberMemberships: true } },
      },
    }),
    prisma.membershipPlan.count({ where: { gymId } }),
  ]);

  return paginatedResponse(plans, total, page, limit);
};

export const getPlanById = async (id) => {
  const plan = await prisma.membershipPlan.findUnique({
    where: { id },
    include: {
      benefits: true,
      _count: { select: { memberMemberships: true } },
    },
  });

  if (!plan) {
    const error = new Error('Membership plan not found');
    error.statusCode = 404;
    throw error;
  }

  return plan;
};

export const updatePlan = async (id, data) => {
  const { benefits, ...planData } = data;

  // If benefits are provided, delete existing and recreate
  if (benefits) {
    await prisma.membershipBenefit.deleteMany({
      where: { membershipPlanId: id },
    });
  }

  return prisma.membershipPlan.update({
    where: { id },
    data: {
      ...planData,
      ...(benefits && {
        benefits: {
          create: benefits.map((b) => ({ description: b })),
        },
      }),
    },
    include: { benefits: true },
  });
};

export const deletePlan = async (id) => {
  return prisma.membershipPlan.update({ where: { id }, data: { isActive: false } });
};
