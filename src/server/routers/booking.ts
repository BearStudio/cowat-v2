import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import {
  zBooking,
  zBookingForDriver,
  zBookingRequest,
} from '@/features/booking/schema';
import { validateStatusTransition } from '@/features/booking/status-machine';
import { Prisma } from '@/server/db/generated/client';
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
      // Find the commute this stop belongs to, including driver's autoAccept setting
      const stop = await context.db.stop.findUnique({
        where: { id: input.stopId },
        select: {
          commuteId: true,
          commute: {
            select: {
              date: true,
              type: true,
              driver: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  autoAccept: true,
                  slackMemberId: true,
                },
              },
            },
          },
        },
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

      const status = stop.commute.driver.autoAccept ? 'ACCEPTED' : 'REQUESTED';

      const booking = await context.db.passengersOnStops.upsert({
        where: {
          passengerId_stopId: {
            passengerId: context.user.id,
            stopId: input.stopId,
          },
        },
        update: {
          status,
          tripType: input.tripType,
          comment: input.comment,
        },
        create: {
          ...input,
          status,
          passengerId: context.user.id,
        },
      });

      const { driver } = stop.commute;
      context.notify({
        type: 'booking.requested',
        recipient: {
          userId: driver.id,
          name: driver.name,
          email: driver.email,
          slackMemberId: driver.slackMemberId,
        },
        payload: {
          passengerName: context.user.name,
          commuteDate: stop.commute.date,
          commuteType: stop.commute.type,
          status,
        },
      });

      return booking;
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
        include: {
          passenger: {
            select: { id: true, name: true, email: true, slackMemberId: true },
          },
          stop: { include: { commute: true } },
        },
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

      context.notify({
        type: 'booking.accepted',
        recipient: {
          userId: booking.passenger.id,
          name: booking.passenger.name,
          email: booking.passenger.email,
          slackMemberId: booking.passenger.slackMemberId,
        },
        payload: {
          driverName: context.user.name,
          commuteDate: booking.stop.commute.date,
          commuteType: booking.stop.commute.type,
        },
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
        include: {
          passenger: {
            select: { id: true, name: true, email: true, slackMemberId: true },
          },
          stop: { include: { commute: true } },
        },
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

      context.notify({
        type: 'booking.refused',
        recipient: {
          userId: booking.passenger.id,
          name: booking.passenger.name,
          email: booking.passenger.email,
          slackMemberId: booking.passenger.slackMemberId,
        },
        payload: {
          driverName: context.user.name,
          commuteDate: booking.stop.commute.date,
          commuteType: booking.stop.commute.type,
        },
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
        include: {
          stop: {
            include: {
              commute: {
                include: {
                  driver: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      slackMemberId: true,
                    },
                  },
                },
              },
            },
          },
        },
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

      const { driver } = booking.stop.commute;
      context.notify({
        type: 'booking.canceled',
        recipient: {
          userId: driver.id,
          name: driver.name,
          email: driver.email,
          slackMemberId: driver.slackMemberId,
        },
        payload: {
          passengerName: context.user.name,
          commuteDate: booking.stop.commute.date,
          commuteType: booking.stop.commute.type,
        },
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
      } satisfies Prisma.PassengersOnStopsWhereInput;

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
      } satisfies Prisma.PassengersOnStopsInclude;

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
