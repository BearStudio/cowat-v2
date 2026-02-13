import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import { zFormFieldsLocation, zLocation } from '@/features/location/schema';
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
      throw new ORPCError('NOT_IMPLEMENTED');
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
      throw new ORPCError('NOT_IMPLEMENTED');
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
      throw new ORPCError('NOT_IMPLEMENTED');
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
      throw new ORPCError('NOT_IMPLEMENTED');
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
      throw new ORPCError('NOT_IMPLEMENTED');
    }),
};
