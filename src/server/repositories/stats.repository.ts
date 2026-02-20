import type { AppDB } from '@/server/db';

export const createStatsRepository = (db: AppDB) => ({
  getMembersWithCounts: (organizationId: string) =>
    db.member.findMany({
      where: { organizationId },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        _count: {
          select: {
            drivenCommutes: true,
            passengerBookings: true,
            drivenTemplates: true,
          },
        },
      },
    }),

  getCommuteStopCounts: (organizationId: string) =>
    db.commute.findMany({
      where: { driver: { organizationId } },
      select: {
        driverMemberId: true,
        _count: { select: { stops: true } },
      },
    }),
});

export type StatsRepository = ReturnType<typeof createStatsRepository>;
