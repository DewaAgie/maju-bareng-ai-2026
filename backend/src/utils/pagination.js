/**
 * Parse pagination parameters from query string.
 * Returns { skip, take, page, limit } for Prisma.
 */
export const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;

  return { skip, take: limit, page, limit };
};

/**
 * Format a paginated response.
 */
export const paginatedResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
