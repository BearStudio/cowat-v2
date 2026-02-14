import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import {
  zBooking,
  zBookingForDriver,
  zBookingRequest,
} from '@/features/booking/schema';
import { validateStatusTransition } from '@/features/booking/status-machine';
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
      // Find the commute this stop belongs to
      const stop = await context.db.stop.findUnique({
        where: { id: input.stopId },
        select: { commuteId: true },
      });

      if (!stop) {
        throw new ORPCError('NOT_FOUND');
      }

      // Check if user already has an active booking on any stop of this commute
      const existingBooking = await context.db.passengersOnStops.findFirst({
        where: {
          passengerId: context.user.id,
          status: { in: ['REQUESTED', 'ACCEPTED'] },
          stop: { commuteId: stop.commuteId },
        },
      });

      if (existingBooking) {
        throw new ORPCError('CONFLICT', {
          message: 'You already have a booking on this commute',
        });
      }

      return await context.db.passengersOnStops.upsert({
        where: {
          passengerId_stopId: {
            passengerId: context.user.id,
            stopId: input.stopId,
          },
        },
        update: {
          status: 'REQUESTED',
          tripType: input.tripType,
          comment: input.comment,
        },
        create: {
          ...input,
          passengerId: context.user.id,
        },
      });
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
      const booking = await context.db.passengersOnStops.findUnique({
        where: { id: input.id },
        include: { stop: { include: { commute: true } } },
      });

      if (!booking) {
        throw new ORPCError('NOT_FOUND');
      }

      if (booking.stop.commute.driverId !== context.user.id) {
        throw new ORPCError('FORBIDDEN');
      }

      validateStatusTransition(booking.status, 'ACCEPTED');

      await context.db.passengersOnStops.update({
        where: { id: input.id },
        data: { status: 'ACCEPTED' },
      });
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
      const booking = await context.db.passengersOnStops.findUnique({
        where: { id: input.id },
        include: { stop: { include: { commute: true } } },
      });

      if (!booking) {
        throw new ORPCError('NOT_FOUND');
      }

      if (booking.stop.commute.driverId !== context.user.id) {
        throw new ORPCError('FORBIDDEN');
      }

      validateStatusTransition(booking.status, 'REFUSED');

      await context.db.passengersOnStops.update({
        where: { id: input.id },
        data: { status: 'REFUSED' },
      });
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
      const booking = await context.db.passengersOnStops.findUnique({
        where: { id: input.id },
      });

      if (!booking) {
        throw new ORPCError('NOT_FOUND');
      }

      if (booking.passengerId !== context.user.id) {
        throw new ORPCError('FORBIDDEN');
      }

      validateStatusTransition(booking.status, 'CANCELED');

      await context.db.passengersOnStops.update({
        where: { id: input.id },
        data: { status: 'CANCELED' },
      });
    }),

  pendingRequestCount: protectedProcedure({ permission: null })
    .route({
      method: 'GET',
      path: '/bookings/pending-count',
      tags,
    })
    .input(z.void())
    .output(z.object({ count: z.number() }))
    .handler(async ({ context }) => {
      const count = await context.db.passengersOnStops.count({
        where: {
          status: 'REQUESTED',
          stop: { commute: { driverId: context.user.id } },
        },
      });
      return { count };
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
      const where = {
        status: 'REQUESTED' as const,
        stop: {
          commute: {
            driverId: context.user.id,
          },
        },
      };

      const include = {
        passenger: { select: { id: true, name: true, image: true } },
        stop: {
          select: {
            id: true,
            order: true,
            outwardTime: true,
            inwardTime: true,
            commute: {
              select: {
                id: true,
                date: true,
                type: true,
              },
            },
          },
        },
      };

      const [total, items] = await Promise.all([
        context.db.passengersOnStops.count({ where }),
        context.db.passengersOnStops.findMany({
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: { createdAt: 'desc' },
          where,
          include,
        }),
      ]);

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor, total };
    }),
};
