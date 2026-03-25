import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import { zCommuteRequestForList } from '@/features/commute-request/schema';
import {
  organizationProcedure,
  type OrganizationProcedureArgs,
} from '@/server/orpc';
import { createCommuteRequestRepository } from '@/server/repositories/commute-request.repository';

const tags = ['commute-requests'];

const procedure = (args: OrganizationProcedureArgs = {}) =>
  organizationProcedure(args).use(({ context, next }) =>
    next({
      context: {
        commuteRequests: createCommuteRequestRepository(context.db),
      },
    })
  );

type TargetStatus = 'FULFILLED' | 'CANCELED';

const VALID_TRANSITIONS: Record<string, TargetStatus[]> = {
  OPEN: ['FULFILLED', 'CANCELED'],
};

export default {
  create: procedure()
    .route({ method: 'POST', path: '/commute-requests', tags })
    .input(
      z.object({
        date: z.date(),
        destination: z.string().optional(),
        comment: z.string().optional(),
      })
    )
    .output(z.void())
    .handler(async ({ context, input }) => {
      const commuteRequest = await context.commuteRequests.create({
        date: input.date,
        destination: input.destination || null,
        comment: input.comment || null,
        requesterMemberId: context.memberId,
      });

      await context.notify(
        {
          type: 'commute.requested',
          payload: {
            requesterName: context.user.name,
            requesterEmail: context.user.email,
            commuteDate: input.date,
            orgSlug: context.orgSlug,
            locationName: input.destination || undefined,
            commuteRequestId: commuteRequest.id,
          },
        },
        { db: context.db, organizationId: context.organizationId }
      );
    }),

  getAll: procedure()
    .route({ method: 'GET', path: '/commute-requests', tags })
    .input(
      z
        .object({
          cursor: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(100).prefault(20),
        })
        .prefault({})
    )
    .output(
      z.object({
        items: z.array(zCommuteRequestForList()),
        nextCursor: z.string().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      const [total, rawItems] = await context.commuteRequests.findPaginated(
        context.organizationId,
        { cursor: input.cursor, limit: input.limit }
      );

      let nextCursor: string | undefined;
      if (rawItems.length > input.limit) nextCursor = rawItems.pop()?.id;

      const items = rawItems.map((item) => ({
        ...item,
        requester: item.requester.user,
      }));

      return { items, nextCursor, total };
    }),

  openCount: procedure()
    .route({ method: 'GET', path: '/commute-requests/open-count', tags })
    .input(z.object({}).prefault({}))
    .output(z.object({ count: z.number() }))
    .handler(async ({ context }) => {
      const count = await context.commuteRequests.countOpen(
        context.organizationId
      );
      return { count };
    }),

  updateStatus: procedure()
    .route({
      method: 'POST',
      path: '/commute-requests/{id}/status',
      tags,
    })
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['FULFILLED', 'CANCELED']),
      })
    )
    .output(z.void())
    .handler(async ({ context, input }) => {
      const request = await context.commuteRequests.findById(input.id);

      if (
        !request ||
        request.requester.organizationId !== context.organizationId
      ) {
        throw new ORPCError('NOT_FOUND');
      }

      if (request.requesterMemberId !== context.memberId) {
        throw new ORPCError('FORBIDDEN');
      }

      if (!VALID_TRANSITIONS[request.status]?.includes(input.status)) {
        throw new ORPCError('BAD_REQUEST', {
          message: `Cannot transition from ${request.status} to ${input.status}`,
        });
      }

      await context.commuteRequests.updateStatus(input.id, input.status);
    }),
};
