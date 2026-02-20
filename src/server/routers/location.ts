import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import { zFormFieldsLocation, zLocation } from '@/features/location/schema';
import { createLocationRepository } from '@/server/repositories/location.repository';
import { createOrgProcedure } from '@/server/orpc';

const tags = ['locations'];

const procedure = createOrgProcedure((db) => ({
  locations: createLocationRepository(db),
}));

export default {
  create: procedure({
    permissions: { location: ['create'] },
  })
    .route({ method: 'POST', path: '/locations', tags })
    .input(zFormFieldsLocation())
    .output(zLocation())
    .handler(async ({ context, input }) => {
      return await context.locations.create({
        ...input,
        memberId: context.memberId,
      });
    }),

  getAll: procedure({
    permissions: { location: ['read'] },
  })
    .route({ method: 'GET', path: '/locations', tags })
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
      const [total, items] = await context.locations.findPaginatedByMember(
        context.memberId,
        {
          cursor: input.cursor,
          limit: input.limit,
        }
      );

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor, total };
    }),

  getById: procedure({
    permissions: { location: ['read'] },
  })
    .route({ method: 'GET', path: '/locations/{id}', tags })
    .input(z.object({ id: z.string() }))
    .output(zLocation())
    .handler(async ({ context, input }) => {
      const location = await context.locations.findByIdInOrg(
        input.id,
        context.organizationId
      );

      if (!location) {
        throw new ORPCError('NOT_FOUND');
      }

      return location;
    }),

  update: procedure({
    permissions: { location: ['update'] },
  })
    .route({ method: 'POST', path: '/locations/{id}', tags })
    .input(
      zLocation().pick({
        id: true,
        name: true,
        address: true,
      })
    )
    .output(zLocation())
    .handler(async ({ context, input }) => {
      const existing = await context.locations.findByIdInOrg(
        input.id,
        context.organizationId
      );

      if (!existing) {
        throw new ORPCError('NOT_FOUND');
      }

      return await context.locations.update(input.id, {
        name: input.name,
        address: input.address,
      });
    }),

  delete: procedure({
    permissions: { location: ['delete'] },
  })
    .route({ method: 'DELETE', path: '/locations/{id}', tags })
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      const existing = await context.locations.findByIdInOrg(
        input.id,
        context.organizationId
      );

      if (!existing) {
        throw new ORPCError('NOT_FOUND');
      }

      await context.locations.delete(input.id);
    }),
};
