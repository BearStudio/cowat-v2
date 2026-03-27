import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import {
  zCommuteTemplate,
  zFormFieldsCommuteTemplate,
  zFormFieldsTemplateStopInput,
  zTemplateStop,
  zTemplateStopWithLocation,
} from '@/features/commute-template/schema';
import {
  organizationProcedure,
  type OrganizationProcedureArgs,
} from '@/server/orpc';
import { createCommuteTemplateRepository } from '@/server/repositories/commute-template.repository';
import {
  assertDriverOwnership,
  paginateResult,
  zPaginatedOutput,
  zPaginationInput,
} from '@/server/routers/utils';

const tags = ['commute-templates'];

const procedure = (args: OrganizationProcedureArgs = {}) =>
  organizationProcedure(args).use(({ context, next }) =>
    next({
      context: { templates: createCommuteTemplateRepository(context.db) },
    })
  );

export default {
  create: procedure({ permissions: { commuteTemplate: ['create'] } })
    .route({ method: 'POST', path: '/commute-templates', tags })
    .input(zFormFieldsCommuteTemplate())
    .output(zCommuteTemplate().extend({ stops: z.array(zTemplateStop()) }))
    .handler(async ({ context, input }) => {
      const { stops, ...templateData } = input;
      return await context.templates.create({
        ...templateData,
        driverMemberId: context.memberId,
        stops: { create: stops.map((stop, i) => ({ ...stop, order: i })) },
      });
    }),

  getAll: procedure({ permissions: { commuteTemplate: ['read'] } })
    .route({ method: 'GET', path: '/commute-templates', tags })
    .input(zPaginationInput.prefault({}))
    .output(
      zPaginatedOutput(
        zCommuteTemplate().extend({
          stops: z.array(zTemplateStopWithLocation()),
        })
      )
    )
    .handler(async ({ context, input }) => {
      const [total, items] = await context.templates.findPaginatedByMember(
        context.memberId,
        {
          cursor: input.cursor,
          limit: input.limit,
        }
      );

      return paginateResult(total, items, input.limit);
    }),

  getById: procedure({ permissions: { commuteTemplate: ['read'] } })
    .route({ method: 'GET', path: '/commute-templates/{id}', tags })
    .input(z.object({ id: z.string() }))
    .output(
      zCommuteTemplate().extend({ stops: z.array(zTemplateStopWithLocation()) })
    )
    .handler(async ({ context, input }) => {
      const template = await context.templates.findById(
        input.id,
        context.organizationId
      );

      if (!template) {
        throw new ORPCError('NOT_FOUND');
      }

      return template;
    }),

  update: procedure({ permissions: { commuteTemplate: ['update'] } })
    .route({ method: 'POST', path: '/commute-templates/{id}', tags })
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        seats: z.number().int().min(1).optional(),
        type: z.enum(['ROUND', 'ONEWAY']).optional(),
        comment: z.string().nullish(),
        stops: z.array(zFormFieldsTemplateStopInput()).min(1).optional(),
      })
    )
    .output(zCommuteTemplate().extend({ stops: z.array(zTemplateStop()) }))
    .handler(async ({ context, input }) => {
      const existing = await context.templates.findForMutation(
        input.id,
        context.organizationId
      );
      assertDriverOwnership(existing, context.memberId);

      const { id, stops, ...data } = input;

      return await context.templates.update(id, {
        ...data,
        ...(stops && {
          stops: {
            deleteMany: {},
            create: stops.map((stop, i) => ({ ...stop, order: i })),
          },
        }),
      });
    }),

  delete: procedure({ permissions: { commuteTemplate: ['delete'] } })
    .route({ method: 'DELETE', path: '/commute-templates/{id}', tags })
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      const existing = await context.templates.findForMutation(
        input.id,
        context.organizationId
      );
      assertDriverOwnership(existing, context.memberId);

      await context.templates.delete(input.id);
    }),
};
