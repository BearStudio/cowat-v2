import type { AppDB } from '@/server/db';

type DateRange = { from?: Date; to?: Date };

export const createStatsRepository = (db: AppDB) => ({
  getMembersWithCounts: (organizationId: string, dateRange?: DateRange) => {
    const dateFilter =
      dateRange?.from || dateRange?.to
        ? { gte: dateRange.from, lt: dateRange.to }
        : undefined;

    return db.member.findMany({
      where: { organizationId },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        _count: {
          select: {
            drivenCommutes: dateFilter ? { where: { date: dateFilter } } : true,
            passengerBookings: dateFilter
              ? {
                  where: {
                    stop: { commute: { date: dateFilter } },
                  },
                }
              : true,
            drivenTemplates: true,
          },
        },
      },
    });
  },

  getCommuteStopCounts: (organizationId: string, dateRange?: DateRange) => {
    const dateFilter =
      dateRange?.from || dateRange?.to
        ? { gte: dateRange.from, lt: dateRange.to }
        : undefined;

    return db.commute.findMany({
      where: {
        driver: { organizationId },
        ...(dateFilter ? { date: dateFilter } : {}),
      },
      select: {
        driverMemberId: true,
        _count: { select: { stops: true } },
      },
    });
  },
});
