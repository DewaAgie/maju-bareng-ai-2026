import prisma from '../config/database.js';
import { parsePagination, paginatedResponse } from '../utils/pagination.js';

export const createPromotion = async (data) => {
  return prisma.promotion.create({ data });
};

export const getPromotionsByGym = async (gymId, query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const activeOnly = query.activeOnly === 'true';

  const where = {
    gymId,
    ...(activeOnly && {
      isActive: true,
      endDate: { gte: new Date() },
    }),
  };

  const [promotions, total] = await Promise.all([
    prisma.promotion.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.promotion.count({ where }),
  ]);

  return paginatedResponse(promotions, total, page, limit);
};

export const getPromotionById = async (id) => {
  const promotion = await prisma.promotion.findUnique({
    where: { id },
  });

  if (!promotion) {
    const error = new Error('Promotion not found');
    error.statusCode = 404;
    throw error;
  }

  return promotion;
};

export const updatePromotion = async (id, data) => {
  return prisma.promotion.update({ where: { id }, data });
};

export const deletePromotion = async (id) => {
  return prisma.promotion.update({ where: { id }, data: { isActive: false } });
};
