import { z } from 'zod';

import { zStatsUser } from '@/features/stats/schema';
import { protectedProcedure } from '@/server/orpc';

const tags = ['stats'];

export default {
  getAll: protectedProcedure({
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

      const [usersWithCounts, commutesWithStops] = await Promise.all([
        context.db.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            _count: {
              select: {
                commutes: true,
                passengerBookings: true,
                commuteTemplates: true,
              },
            },
          },
        }),
        context.db.commute.findMany({
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
