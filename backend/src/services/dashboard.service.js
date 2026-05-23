import prisma from '../config/database.js';

export const getDashboardStats = async (gymId) => {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Run all queries in parallel
  const [
    totalActiveMembers,
    newMembersThisMonth,
    todayAttendance,
    activeClasses,
    activePromotions,
    attendanceTrend,
    topClasses,
  ] = await Promise.all([
    // Total active members
    prisma.member.count({
      where: { gymId, isActive: true },
    }),

    // New members this month
    prisma.member.count({
      where: {
        gymId,
        createdAt: { gte: monthStart },
      },
    }),

    // Today's attendance count
    prisma.attendanceLog.count({
      where: {
        gymId,
        checkInAt: { gte: todayStart, lte: todayEnd },
      },
    }),

    // Active classes count
    prisma.class.count({
      where: { gymId, isActive: true },
    }),

    // Active promotions count
    prisma.promotion.count({
      where: {
        gymId,
        isActive: true,
        endDate: { gte: now },
      },
    }),

    // Attendance trend: last 30 days (daily count)
    (async () => {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const logs = await prisma.attendanceLog.findMany({
        where: {
          gymId,
          checkInAt: { gte: thirtyDaysAgo },
        },
        select: { checkInAt: true },
        orderBy: { checkInAt: 'asc' },
      });

      // Group by date
      const trend = {};
      for (let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (29 - i));
        const key = date.toISOString().split('T')[0];
        trend[key] = 0;
      }

      logs.forEach((log) => {
        const key = log.checkInAt.toISOString().split('T')[0];
        if (trend[key] !== undefined) {
          trend[key]++;
        }
      });

      return Object.entries(trend).map(([date, count]) => ({ date, count }));
    })(),

    // Top 5 most enrolled classes
    (async () => {
      const classes = await prisma.class.findMany({
        where: { gymId, isActive: true },
        include: {
          classSchedules: {
            include: {
              _count: { select: { enrollments: true } },
            },
          },
        },
      });

      return classes
        .map((cls) => ({
          id: cls.id,
          name: cls.name,
          category: cls.category,
          totalEnrollments: cls.classSchedules.reduce(
            (sum, sched) => sum + sched._count.enrollments,
            0
          ),
        }))
        .sort((a, b) => b.totalEnrollments - a.totalEnrollments)
        .slice(0, 5);
    })(),
  ]);

  return {
    totalActiveMembers,
    newMembersThisMonth,
    todayAttendance,
    activeClasses,
    activePromotions,
    attendanceTrend,
    topClasses,
  };
};
