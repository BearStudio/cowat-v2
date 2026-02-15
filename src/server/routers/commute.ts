import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import {
  zCommute,
  zCommuteEnriched,
  zCommuteType,
  zStop,
  zStopInput,
} from '@/features/commute/schema';
import { Prisma } from '@/server/db/generated/browser';
import { organizationProcedure } from '@/server/orpc';

const tags = ['commutes'];

export default {
  create: organizationProcedure({ permission: null })
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
    .handler(async ({ context, input }) => {
      const { stops, ...commuteData } = input;
      const commute = await context.db.commute.create({
        data: {
          ...commuteData,
          driverId: context.user.id,
          organizationId: context.organizationId,
          stops: {
            create: stops,
          },
        },
        include: { stops: true },
      });

      context.notify({
        type: 'commute.created',
        payload: {
          driverName: context.user.name,
          driverEmail: context.user.email,
          commuteDate: input.date,
          commuteType: input.type,
        },
      });

      return commute;
    }),

  getById: organizationProcedure({ permission: null })
    .route({
      method: 'GET',
      path: '/commutes/{id}',
      tags,
    })
    .input(z.object({ id: z.string() }))
    .output(zCommute().extend({ stops: z.array(zStop()) }))
    .handler(async ({ context, input }) => {
      const commute = await context.db.commute.findFirst({
        where: { id: input.id, organizationId: context.organizationId },
        include: { stops: true },
      });

      if (!commute) {
        throw new ORPCError('NOT_FOUND');
      }

      return commute;
    }),

  getByDate: organizationProcedure({ permission: null })
    .route({
      method: 'GET',
      path: '/commutes/by-date',
      tags,
    })
    .input(z.object({ from: z.date(), to: z.date() }))
    .output(z.array(zCommuteEnriched()))
    .handler(async ({ context, input }) => {
      return await context.db.commute.findMany({
        where: {
          date: { gte: input.from, lt: input.to },
          organizationId: context.organizationId,
        },
        orderBy: { date: 'asc' },
        include: {
          driver: { select: { id: true, name: true, image: true } },
          stops: {
            orderBy: { order: 'asc' },
            include: {
              location: { select: { id: true, name: true } },
              passengers: {
                include: {
                  passenger: {
                    select: { id: true, name: true, image: true },
                  },
                },
              },
            },
          },
        },
      });
    }),

  getMyCommutes: organizationProcedure({ permission: null })
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
        items: z.array(zCommuteEnriched()),
        nextCursor: z.string().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const where = {
        organizationId: context.organizationId,
        date: { gte: today },
        OR: [
          { driverId: context.user.id },
          {
            stops: {
              some: {
                passengers: {
                  some: { passengerId: context.user.id, status: 'ACCEPTED' },
                },
              },
            },
          },
        ],
      } satisfies Prisma.CommuteWhereInput;

      const include = {
        driver: { select: { id: true, name: true, image: true } },
        stops: {
          orderBy: { order: 'asc' as const },
          include: {
            location: { select: { id: true, name: true } },
            passengers: {
              include: {
                passenger: {
                  select: { id: true, name: true, image: true },
                },
              },
            },
          },
        },
      } satisfies Prisma.CommuteInclude;

      const [total, items] = await Promise.all([
        context.db.commute.count({ where }),
        context.db.commute.findMany({
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: { date: 'asc' },
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

  update: organizationProcedure({ permission: null })
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
    .handler(async ({ context, input }) => {
      const existing = await context.db.commute.findFirst({
        where: { id: input.id, organizationId: context.organizationId },
      });

      if (!existing) {
        throw new ORPCError('NOT_FOUND');
      }

      if (existing.driverId !== context.user.id) {
        throw new ORPCError('FORBIDDEN');
      }

      const { id, stops, ...data } = input;

      const commute = await context.db.commute.update({
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

      const affectedPassengers = await context.db.passengersOnStops.findMany({
        where: {
          stop: { commuteId: id },
          status: { in: ['REQUESTED', 'ACCEPTED'] },
        },
        include: {
          passenger: {
            select: {
              id: true,
              name: true,
              email: true,
              notificationPreferences: {
                where: { enabled: false },
                select: { channel: true },
              },
            },
          },
        },
      });

      for (const booking of affectedPassengers) {
        context.notify({
          type: 'commute.updated',
          recipient: {
            userId: booking.passenger.id,
            name: booking.passenger.name,
            email: booking.passenger.email,
            disabledChannels: booking.passenger.notificationPreferences.map(
              (p) => p.channel.toLowerCase()
            ),
          },
          payload: {
            driverName: context.user.name,
            commuteDate: existing.date,
            commuteType: existing.type,
          },
        });
      }

      return commute;
    }),

  cancel: organizationProcedure({ permission: null })
    .route({
      method: 'POST',
      path: '/commutes/{id}/cancel',
      tags,
    })
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      const existing = await context.db.commute.findFirst({
        where: { id: input.id, organizationId: context.organizationId },
      });

      if (!existing) {
        throw new ORPCError('NOT_FOUND');
      }

      if (existing.driverId !== context.user.id) {
        throw new ORPCError('FORBIDDEN');
      }

      const affectedPassengers = await context.db.passengersOnStops.findMany({
        where: {
          stop: { commuteId: input.id },
          status: { in: ['REQUESTED', 'ACCEPTED'] },
        },
        include: {
          passenger: {
            select: {
              id: true,
              name: true,
              email: true,
              notificationPreferences: {
                where: { enabled: false },
                select: { channel: true },
              },
            },
          },
        },
      });

      await context.db.commute.delete({
        where: { id: input.id },
      });

      for (const booking of affectedPassengers) {
        context.notify({
          type: 'commute.canceled',
          recipient: {
            userId: booking.passenger.id,
            name: booking.passenger.name,
            email: booking.passenger.email,
            disabledChannels: booking.passenger.notificationPreferences.map(
              (p) => p.channel.toLowerCase()
            ),
          },
          payload: {
            driverName: context.user.name,
            commuteDate: existing.date,
            commuteType: existing.type,
          },
        });
      }
    }),
};
