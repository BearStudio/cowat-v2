import { z } from 'zod';

import {
  zBooking,
  zBookingForDriver,
  zBookingRequest,
} from '@/features/booking/schema';
import { protectedProcedure } from '@/server/orpc';

const tags = ['bookings'];

export default {
  request: protectedProcedure({ permission: null })
    .route({
      method: 'POST',
      path: '/bookings/request',
      tags,
    })
    .input(zBookingRequest())
    .output(zBooking())
    .handler(async ({ context, input }) => {
      // TODO: implement
      throw new Error('Not implemented');
    }),

  accept: protectedProcedure({ permission: null })
    .route({
      method: 'POST',
      path: '/bookings/{id}/accept',
      tags,
    })
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      // TODO: implement
      throw new Error('Not implemented');
    }),

  refuse: protectedProcedure({ permission: null })
    .route({
      method: 'POST',
      path: '/bookings/{id}/refuse',
      tags,
    })
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      // TODO: implement
      throw new Error('Not implemented');
    }),

  cancel: protectedProcedure({ permission: null })
    .route({
      method: 'POST',
      path: '/bookings/{id}/cancel',
      tags,
    })
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      // TODO: implement
      throw new Error('Not implemented');
    }),

  getRequestsForDriver: protectedProcedure({ permission: null })
    .route({
      method: 'GET',
      path: '/bookings/driver-requests',
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
        items: z.array(zBookingForDriver()),
        nextCursor: z.string().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      // TODO: implement
      throw new Error('Not implemented');
    }),
};
