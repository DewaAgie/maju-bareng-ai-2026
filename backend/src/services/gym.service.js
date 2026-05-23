import prisma from '../config/database.js';
import { parsePagination, paginatedResponse } from '../utils/pagination.js';

export const createGym = async (data) => {
  return prisma.gym.create({ data });
};

export const getAllGyms = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const search = query.search || '';

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [gyms, total] = await Promise.all([
    prisma.gym.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            coaches: true,
            members: true,
            classes: true,
            facilities: true,
          },
        },
      },
    }),
    prisma.gym.count({ where }),
  ]);

  return paginatedResponse(gyms, total, page, limit);
};

export const getGymById = async (id) => {
  const gym = await prisma.gym.findUnique({
    where: { id },
    include: {
      coaches: { where: { isActive: true }, select: { id: true, fullName: true, specializations: true, avatarUrl: true } },
      facilities: { where: { isActive: true }, select: { id: true, name: true, capacity: true } },
      _count: {
        select: {
          coaches: true,
          members: true,
          classes: true,
          facilities: true,
          promotions: true,
        },
      },
    },
  });

  if (!gym) {
    const error = new Error('Gym not found');
    error.statusCode = 404;
    throw error;
  }

  return gym;
};

export const updateGym = async (id, data) => {
  return prisma.gym.update({ where: { id }, data });
};

export const deleteGym = async (id) => {
  return prisma.gym.update({ where: { id }, data: { isActive: false } });
};
