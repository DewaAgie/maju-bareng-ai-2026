import prisma from '../config/database.js';
import { parsePagination, paginatedResponse } from '../utils/pagination.js';

export const createClass = async (data) => {
  return prisma.class.create({ data });
};

export const getClassesByGym = async (gymId, query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const search = query.search || '';
  const category = query.category || '';
  const isActive = query.isActive !== undefined ? query.isActive === 'true' : undefined;

  const where = {
    gymId,
    ...(category && { category: { equals: category, mode: 'insensitive' } }),
    ...(isActive !== undefined && { isActive }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [classes, total] = await Promise.all([
    prisma.class.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { classSchedules: true } },
      },
    }),
    prisma.class.count({ where }),
  ]);

  return paginatedResponse(classes, total, page, limit);
};

export const getClassById = async (id) => {
  const cls = await prisma.class.findUnique({
    where: { id },
    include: {
      gym: { select: { id: true, name: true } },
      classSchedules: {
        include: {
          coach: { select: { id: true, fullName: true } },
          facility: { select: { id: true, name: true } },
          _count: { select: { enrollments: true } },
        },
      },
    },
  });

  if (!cls) {
    const error = new Error('Class not found');
    error.statusCode = 404;
    throw error;
  }

  return cls;
};

export const updateClass = async (id, data) => {
  return prisma.class.update({ where: { id }, data });
};

export const deleteClass = async (id) => {
  return prisma.class.update({ where: { id }, data: { isActive: false } });
};
