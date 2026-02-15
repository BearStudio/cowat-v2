import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import { zFormFieldsLocation, zLocation } from '@/features/location/schema';
import { Prisma } from '@/server/db/generated/client';
import { protectedProcedure } from '@/server/orpc';

const tags = ['locations'];

export default {
  create: protectedProcedure({
    permission: null,
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
          userId: context.user.id,
        },
      });
    }),

  getAll: protectedProcedure({
    permission: null,
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
        userId: context.user.id,
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

  getById: protectedProcedure({
    permission: null,
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
      const location = await context.db.location.findUnique({
        where: { id: input.id },
      });

      if (!location) {
        throw new ORPCError('NOT_FOUND');
      }

      return location;
    }),

  update: protectedProcedure({
    permission: null,
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
      const updated = await context.db.location.update({
        where: { id: input.id },
        data: {
          name: input.name,
          address: input.address,
        },
      });

      if (!updated) {
        throw new ORPCError('NOT_FOUND');
      }

      return updated;
    }),

  delete: protectedProcedure({
    permission: null,
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
      const deleted = await context.db.location.delete({
        where: { id: input.id },
      });

      if (!deleted) {
        throw new ORPCError('NOT_FOUND');
      }
    }),
};
