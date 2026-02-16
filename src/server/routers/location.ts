import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import { zFormFieldsLocation, zLocation } from '@/features/location/schema';
import { Prisma } from '@/server/db/generated/client';
import { organizationProcedure } from '@/server/orpc';

const tags = ['locations'];

export default {
  create: organizationProcedure({
    permissions: {
      location: ['create'],
    },
  })
    .route({
      method: 'POST',
      path: '/locations',
      tags,
    })
    .input(zFormFieldsLocation())
    .output(zLocation())
    .handler(async ({ context, input }) => {
      return await context.db.location.create({
        data: {
          ...input,
          memberId: context.memberId,
        },
      });
    }),

  getAll: organizationProcedure({
    permissions: {
      location: ['read'],
    },
  })
    .route({
      method: 'GET',
      path: '/locations',
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
        items: z.array(zLocation()),
        nextCursor: z.string().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      const where = {
        memberId: context.memberId,
      } satisfies Prisma.LocationWhereInput;

      const [total, items] = await Promise.all([
        context.db.location.count({ where }),
        context.db.location.findMany({
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: { name: 'asc' },
          where,
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
      location: ['read'],
    },
  })
    .route({
      method: 'GET',
      path: '/locations/{id}',
      tags,
    })
    .input(
      z.object({
        id: z.string(),
      })
    )
    .output(zLocation())
    .handler(async ({ context, input }) => {
      const location = await context.db.location.findFirst({
        where: {
          id: input.id,
          member: { organizationId: context.organizationId },
        },
      });

      if (!location) {
        throw new ORPCError('NOT_FOUND');
      }

      return location;
    }),

  update: organizationProcedure({
    permissions: {
      location: ['update'],
    },
  })
    .route({
      method: 'POST',
      path: '/locations/{id}',
      tags,
    })
    .input(
      zLocation().pick({
        id: true,
        name: true,
        address: true,
      })
    )
    .output(zLocation())
    .handler(async ({ context, input }) => {
      const existing = await context.db.location.findFirst({
        where: {
          id: input.id,
          member: { organizationId: context.organizationId },
        },
      });

      if (!existing) {
        throw new ORPCError('NOT_FOUND');
      }

      return await context.db.location.update({
        where: { id: input.id },
        data: {
          name: input.name,
          address: input.address,
        },
      });
    }),

  delete: organizationProcedure({
    permissions: {
      location: ['delete'],
    },
  })
    .route({
      method: 'DELETE',
      path: '/locations/{id}',
      tags,
    })
    .input(
      z.object({
        id: z.string(),
      })
    )
    .output(z.void())
    .handler(async ({ context, input }) => {
      const existing = await context.db.location.findFirst({
        where: {
          id: input.id,
          member: { organizationId: context.organizationId },
        },
      });

      if (!existing) {
        throw new ORPCError('NOT_FOUND');
      }

      await context.db.location.delete({
        where: { id: input.id },
      });
    }),
};
