import prisma from '../config/database.js';
import { parsePagination, paginatedResponse } from '../utils/pagination.js';

export const createFacility = async (data) => {
  return prisma.facility.create({ data });
};

export const getFacilitiesByGym = async (gymId, query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const search = query.search || '';

  const where = {
    gymId,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [facilities, total] = await Promise.all([
    prisma.facility.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.facility.count({ where }),
  ]);

  return paginatedResponse(facilities, total, page, limit);
};

export const getFacilityById = async (id) => {
  const facility = await prisma.facility.findUnique({
    where: { id },
    include: { gym: { select: { id: true, name: true } } },
  });

  if (!facility) {
    const error = new Error('Facility not found');
    error.statusCode = 404;
    throw error;
  }

  return facility;
};

export const updateFacility = async (id, data) => {
  return prisma.facility.update({ where: { id }, data });
};

export const deleteFacility = async (id) => {
  return prisma.facility.update({ where: { id }, data: { isActive: false } });
};
