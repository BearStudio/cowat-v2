import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import {
  zCommuteTemplate,
  zFormFieldsCommuteTemplate,
  zFormFieldsTemplateStopInput,
  zTemplateStop,
  zTemplateStopWithLocation,
} from '@/features/commute-template/schema';
import { Prisma } from '@/server/db/generated/client';
import { organizationProcedure } from '@/server/orpc';

const tags = ['commute-templates'];

export default {
  create: organizationProcedure({
    permissions: {
      commuteTemplate: ['create'],
    },
  })
    .route({
      method: 'POST',
      path: '/commute-templates',
      tags,
    })
    .input(zFormFieldsCommuteTemplate())
    .output(zCommuteTemplate().extend({ stops: z.array(zTemplateStop()) }))
    .handler(async ({ context, input }) => {
      const { stops, ...templateData } = input;
      return await context.db.commuteTemplate.create({
        data: {
          ...templateData,
          driverMemberId: context.memberId,
          stops: {
            create: stops,
          },
        },
        include: { stops: true },
      });
    }),

  getAll: organizationProcedure({
    permissions: {
      commuteTemplate: ['read'],
    },
  })
    .route({
      method: 'GET',
      path: '/commute-templates',
      tags,
    })
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
        items: z.array(
          zCommuteTemplate().extend({
            stops: z.array(zTemplateStopWithLocation()),
          })
        ),
        nextCursor: z.string().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      const where = {
        driverMemberId: context.memberId,
      } satisfies Prisma.CommuteTemplateWhereInput;

      const [total, items] = await Promise.all([
        context.db.commuteTemplate.count({ where }),
        context.db.commuteTemplate.findMany({
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: { name: 'asc' },
          where,
          include: {
            stops: {
              orderBy: { order: 'asc' },
              include: {
                location: { select: { id: true, name: true } },
              },
            },
          },
        }),
      ]);

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor, total };
    }),

  getById: organizationProcedure({
    permissions: {
      commuteTemplate: ['read'],
    },
  })
    .route({
      method: 'GET',
      path: '/commute-templates/{id}',
      tags,
    })
    .input(z.object({ id: z.string() }))
    .output(
      zCommuteTemplate().extend({
        stops: z.array(zTemplateStopWithLocation()),
      })
    )
    .handler(async ({ context, input }) => {
      const template = await context.db.commuteTemplate.findFirst({
        where: {
          id: input.id,
          driver: { organizationId: context.organizationId },
        },
        include: {
          stops: {
            orderBy: { order: 'asc' },
            include: {
              location: { select: { id: true, name: true } },
            },
          },
        },
      });

      if (!template) {
        throw new ORPCError('NOT_FOUND');
      }

      return template;
    }),

  update: organizationProcedure({
    permissions: {
      commuteTemplate: ['update'],
    },
  })
    .route({
      method: 'POST',
      path: '/commute-templates/{id}',
      tags,
    })
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
      const existing = await context.db.commuteTemplate.findFirst({
        where: {
          id: input.id,
          driver: { organizationId: context.organizationId },
        },
      });

      if (!existing) {
        throw new ORPCError('NOT_FOUND');
      }

      if (existing.driverMemberId !== context.memberId) {
        throw new ORPCError('FORBIDDEN');
      }

      const { id, stops, ...data } = input;

      return await context.db.commuteTemplate.update({
        where: { id },
        data: {
          ...data,
          ...(stops && {
            stops: {
              deleteMany: {},
              create: stops,
            },
          }),
        },
        include: { stops: true },
      });
    }),

  delete: organizationProcedure({
    permissions: {
      commuteTemplate: ['delete'],
    },
  })
    .route({
      method: 'DELETE',
      path: '/commute-templates/{id}',
      tags,
    })
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      const existing = await context.db.commuteTemplate.findFirst({
        where: {
          id: input.id,
          driver: { organizationId: context.organizationId },
        },
      });

      if (!existing) {
        throw new ORPCError('NOT_FOUND');
      }

      if (existing.driverMemberId !== context.memberId) {
        throw new ORPCError('FORBIDDEN');
      }

      await context.db.commuteTemplate.delete({
        where: { id: input.id },
      });
    }),
};
