import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import { zStatsUser } from '@/features/stats/schema';
import {
  organizationProcedure,
  type OrganizationProcedureArgs,
} from '@/server/orpc';
import { createOrganizationRepository } from '@/server/repositories/organization.repository';
import { createStatsRepository } from '@/server/repositories/stats.repository';

const tags = ['stats'];

const procedure = (args: OrganizationProcedureArgs = {}) =>
  organizationProcedure(args).use(({ context, next }) =>
    next({
      context: {
        stats: createStatsRepository(context.db),
        organizations: createOrganizationRepository(context.db),
      },
    })
  );

export default {
  getAll: procedure()
    .route({ method: 'GET', path: '/stats', tags })
    .input(
      z.object({
        orgSlug: z.string(),
        from: z.coerce.date().optional(),
        to: z.coerce.date().optional(),
      })
    )
    .output(z.object({ users: z.array(zStatsUser()) }))
    .handler(async ({ context, input }) => {
      context.logger.info('Getting stats from database');

      const org = await context.organizations.findBySlugWithDetails(
        input.orgSlug
      );
      if (!org) throw new ORPCError('NOT_FOUND');

      const isMember = org.members.some((m) => m.user.id === context.user.id);
      if (!isMember) throw new ORPCError('FORBIDDEN');

      const dateRange = input.from || input.to ? input : undefined;

      const [membersWithCounts, commutesWithStops] = await Promise.all([
        context.stats.getMembersWithCounts(org.id, dateRange),
        context.stats.getCommuteStopCounts(org.id, dateRange),
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
