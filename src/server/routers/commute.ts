import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import {
  zCommute,
  zCommuteType,
  zStop,
  zStopInput,
} from '@/features/commute/schema';
import { protectedProcedure } from '@/server/orpc';

const tags = ['commutes'];

export default {
  create: protectedProcedure({ permission: null })
    .route({
      method: 'POST',
      path: '/commutes',
      tags,
    })
    .input(
      z.object({
        date: z.date(),
        seats: z.number().int().min(1),
        type: zCommuteType(),
        comment: z.string().nullish(),
        stops: z.array(zStopInput()).min(1),
      })
    )
    .output(zCommute().extend({ stops: z.array(zStop()) }))
    .handler(async () => {
      // TODO: implement
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Not implemented',
      });
    }),

  getById: protectedProcedure({ permission: null })
    .route({
      method: 'GET',
      path: '/commutes/{id}',
      tags,
    })
    .input(z.object({ id: z.string() }))
    .output(zCommute().extend({ stops: z.array(zStop()) }))
    .handler(async () => {
      // TODO: implement
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Not implemented',
      });
    }),

  getByDate: protectedProcedure({ permission: null })
    .route({
      method: 'GET',
      path: '/commutes/by-date',
      tags,
    })
    .input(z.object({ date: z.date() }))
    .output(z.array(zCommute().extend({ stops: z.array(zStop()) })))
    .handler(async () => {
      // TODO: implement
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Not implemented',
      });
    }),

  getMyCommutes: protectedProcedure({ permission: null })
    .route({
      method: 'GET',
      path: '/commutes/mine',
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
        items: z.array(zCommute()),
        nextCursor: z.string().optional(),
        total: z.number(),
      })
    )
    .handler(async () => {
      // TODO: implement
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Not implemented',
      });
    }),

  update: protectedProcedure({ permission: null })
    .route({
      method: 'POST',
      path: '/commutes/{id}',
      tags,
    })
    .input(
      z.object({
        id: z.string(),
        seats: z.number().int().min(1).optional(),
        type: zCommuteType().optional(),
        comment: z.string().nullish(),
        stops: z.array(zStopInput()).min(1).optional(),
      })
    )
    .output(zCommute().extend({ stops: z.array(zStop()) }))
    .handler(async () => {
      // TODO: implement
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Not implemented',
      });
    }),

  cancel: protectedProcedure({ permission: null })
    .route({
      method: 'POST',
      path: '/commutes/{id}/cancel',
      tags,
    })
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .handler(async () => {
      // TODO: implement
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Not implemented',
      });
    }),
};
