import { z } from 'zod';

import { zStatsUser } from '@/features/stats/schema';
import {
  organizationProcedure,
  type OrganizationProcedureArgs,
} from '@/server/orpc';
import { createStatsRepository } from '@/server/repositories/stats.repository';

const tags = ['stats'];

const procedure = (args: OrganizationProcedureArgs = {}) =>
  organizationProcedure(args).use(({ context, next }) =>
    next({ context: { stats: createStatsRepository(context.db) } })
  );

export default {
  getAll: procedure()
    .route({ method: 'GET', path: '/stats', tags })
    .output(z.object({ users: z.array(zStatsUser()) }))
    .handler(async ({ context }) => {
      context.logger.info('Getting stats from database');

      const [membersWithCounts, commutesWithStops] = await Promise.all([
        context.stats.getMembersWithCounts(context.organizationId),
        context.stats.getCommuteStopCounts(context.organizationId),
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
