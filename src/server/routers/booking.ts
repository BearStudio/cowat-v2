import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import {
  zBooking,
  zBookingForDriver,
  zBookingRequest,
} from '@/features/booking/schema';
import { validateStatusTransition } from '@/features/booking/status-machine';
import { Prisma } from '@/server/db/generated/client';
import { organizationProcedure } from '@/server/orpc';

const tags = ['bookings'];

export default {
  request: organizationProcedure({
    permissions: {
      booking: ['request'],
    },
  })
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
              driverMemberId: true,
              date: true,
              type: true,
              driver: {
                select: {
                  organizationId: true,
                  autoAccept: true,
                  notificationPreferences: {
                    where: { enabled: false },
                    select: { channel: true },
                  },
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (
        !stop ||
        stop.commute.driver.organizationId !== context.organizationId
      ) {
        throw new ORPCError('NOT_FOUND');
      }

      // Check if user already has an active booking on any stop of this commute
      const existingBooking = await context.db.passengersOnStops.findFirst({
        where: {
          passengerMemberId: context.memberId,
          status: { in: ['REQUESTED', 'ACCEPTED'] },
          stop: { commuteId: stop.commuteId },
        },
      });

      if (existingBooking) {
        throw new ORPCError('CONFLICT', {
          message: 'You already have a booking on this commute',
        });
      }

      const driverMember = stop.commute.driver;
      const driverUser = driverMember.user;
      const status = driverMember.autoAccept ? 'ACCEPTED' : 'REQUESTED';

      const booking = await context.db.passengersOnStops.upsert({
        where: {
          passengerMemberId_stopId: {
            passengerMemberId: context.memberId,
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
          passengerMemberId: context.memberId,
        },
      });

      context.notify({
        type: 'booking.requested',
        recipient: {
          userId: driverUser.id,
          name: driverUser.name,
          email: driverUser.email,
          disabledChannels: driverMember.notificationPreferences.map((p) =>
            p.channel.toLowerCase()
          ),
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

  accept: organizationProcedure({
    permissions: {
      booking: ['manage'],
    },
  })
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
            include: {
              notificationPreferences: {
                where: { enabled: false },
                select: { channel: true },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          stop: { include: { commute: true } },
        },
      });

      if (!booking) {
        throw new ORPCError('NOT_FOUND');
      }

      if (booking.stop.commute.driverMemberId !== context.memberId) {
        throw new ORPCError('FORBIDDEN');
      }

      validateStatusTransition(booking.status, 'ACCEPTED');

      await context.db.passengersOnStops.update({
        where: { id: input.id },
        data: { status: 'ACCEPTED' },
      });

      const passengerUser = booking.passenger.user;
      context.notify({
        type: 'booking.accepted',
        recipient: {
          userId: passengerUser.id,
          name: passengerUser.name,
          email: passengerUser.email,
          disabledChannels: booking.passenger.notificationPreferences.map((p) =>
            p.channel.toLowerCase()
          ),
        },
        payload: {
          driverName: context.user.name,
          commuteDate: booking.stop.commute.date,
          commuteType: booking.stop.commute.type,
        },
      });
    }),

  refuse: organizationProcedure({
    permissions: {
      booking: ['manage'],
    },
  })
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
            include: {
              notificationPreferences: {
                where: { enabled: false },
                select: { channel: true },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          stop: { include: { commute: true } },
        },
      });

      if (!booking) {
        throw new ORPCError('NOT_FOUND');
      }

      if (booking.stop.commute.driverMemberId !== context.memberId) {
        throw new ORPCError('FORBIDDEN');
      }

      validateStatusTransition(booking.status, 'REFUSED');

      await context.db.passengersOnStops.update({
        where: { id: input.id },
        data: { status: 'REFUSED' },
      });

      const passengerUser = booking.passenger.user;
      context.notify({
        type: 'booking.refused',
        recipient: {
          userId: passengerUser.id,
          name: passengerUser.name,
          email: passengerUser.email,
          disabledChannels: booking.passenger.notificationPreferences.map((p) =>
            p.channel.toLowerCase()
          ),
        },
        payload: {
          driverName: context.user.name,
          commuteDate: booking.stop.commute.date,
          commuteType: booking.stop.commute.type,
        },
      });
    }),

  cancel: organizationProcedure({
    permissions: {
      booking: ['manage'],
    },
  })
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
                    include: {
                      notificationPreferences: {
                        where: { enabled: false },
                        select: { channel: true },
                      },
                      user: {
                        select: {
                          id: true,
                          name: true,
                          email: true,
                        },
                      },
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

      if (booking.passengerMemberId !== context.memberId) {
        throw new ORPCError('FORBIDDEN');
      }

      validateStatusTransition(booking.status, 'CANCELED');

      await context.db.passengersOnStops.update({
        where: { id: input.id },
        data: { status: 'CANCELED' },
      });

      const driverMember = booking.stop.commute.driver;
      const driverUser = driverMember.user;
      context.notify({
        type: 'booking.canceled',
        recipient: {
          userId: driverUser.id,
          name: driverUser.name,
          email: driverUser.email,
          disabledChannels: driverMember.notificationPreferences.map((p) =>
            p.channel.toLowerCase()
          ),
        },
        payload: {
          passengerName: context.user.name,
          commuteDate: booking.stop.commute.date,
          commuteType: booking.stop.commute.type,
        },
      });
    }),

  pendingRequestCount: organizationProcedure({
    permissions: {
      booking: ['read'],
    },
  })
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
          stop: {
            commute: {
              driverMemberId: context.memberId,
              date: { gte: new Date() },
            },
          },
        },
      });
      return { count };
    }),

  getRequestsForDriver: organizationProcedure({
    permissions: {
      booking: ['read'],
    },
  })
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
            driverMemberId: context.memberId,
            date: { gte: new Date() },
          },
        },
      } satisfies Prisma.PassengersOnStopsWhereInput;

      const include = {
        passenger: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
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

      const [total, rawItems] = await Promise.all([
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
      if (rawItems.length > input.limit) {
        const nextItem = rawItems.pop();
        nextCursor = nextItem?.id;
      }

      const items = rawItems.map((item) => ({
        ...item,
        passenger: item.passenger.user,
      }));

      return { items, nextCursor, total };
    }),
};
