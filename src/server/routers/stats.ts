import { z } from 'zod';

import { zStatsUser } from '@/features/stats/schema';
import { organizationProcedure } from '@/server/orpc';

const tags = ['stats'];

export default {
  getAll: organizationProcedure({
    permission: {
      user: ['list'],
    },
  })
    .route({
      method: 'GET',
      path: '/stats',
      tags,
    })
    .output(
      z.object({
        users: z.array(zStatsUser()),
      })
    )
    .handler(async ({ context }) => {
      context.logger.info('Getting stats from database');

      // Get org member user IDs
      const orgMembers = await context.db.member.findMany({
        where: { organizationId: context.organizationId },
        select: { userId: true },
      });
      const memberUserIds = orgMembers.map((m) => m.userId);

      const [usersWithCounts, commutesWithStops] = await Promise.all([
        context.db.user.findMany({
          where: { id: { in: memberUserIds } },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            _count: {
              select: {
                commutes: {
                  where: { organizationId: context.organizationId },
                },
                passengerBookings: true,
                commuteTemplates: {
                  where: { organizationId: context.organizationId },
                },
              },
            },
          },
        }),
        context.db.commute.findMany({
          where: { organizationId: context.organizationId },
          select: {
            driverId: true,
            _count: {
              select: {
                stops: true,
              },
            },
          },
        }),
      ]);

      const stopCountByDriver = new Map<string, number>();
      for (const commute of commutesWithStops) {
        stopCountByDriver.set(
          commute.driverId,
          (stopCountByDriver.get(commute.driverId) ?? 0) + commute._count.stops
        );
      }

      const users = usersWithCounts.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        commuteCount: user._count.commutes,
        bookingCount: user._count.passengerBookings,
        templateCount: user._count.commuteTemplates,
        stopCount: stopCountByDriver.get(user.id) ?? 0,
      }));

      return { users };
    }),
};
