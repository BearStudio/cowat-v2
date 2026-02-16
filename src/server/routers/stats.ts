import { z } from 'zod';

import { zStatsUser } from '@/features/stats/schema';
import { organizationProcedure } from '@/server/orpc';

const tags = ['stats'];

export default {
  getAll: organizationProcedure()
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

      const orgId = context.organizationId;

      const [membersWithCounts, commutesWithStops] = await Promise.all([
        context.db.member.findMany({
          where: { organizationId: orgId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
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
        context.db.commute.findMany({
          where: { driver: { organizationId: orgId } },
          select: {
            driverMemberId: true,
            _count: {
              select: {
                stops: true,
              },
            },
          },
        }),
      ]);

      const stopCountByMember = new Map<string, number>();
      for (const commute of commutesWithStops) {
        stopCountByMember.set(
          commute.driverMemberId,
          (stopCountByMember.get(commute.driverMemberId) ?? 0) +
            commute._count.stops
        );
      }

      const users = membersWithCounts.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        image: member.user.image,
        commuteCount: member._count.drivenCommutes,
        bookingCount: member._count.passengerBookings,
        templateCount: member._count.drivenTemplates,
        stopCount: stopCountByMember.get(member.id) ?? 0,
      }));

      return { users };
    }),
};
