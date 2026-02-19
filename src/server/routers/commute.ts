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
  create: organizationProcedure({
    permissions: {
      commute: ['create'],
    },
  })
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
          driverMemberId: context.memberId,
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

  getById: organizationProcedure({
    permissions: {
      commute: ['read'],
    },
  })
    .route({
      method: 'GET',
      path: '/commutes/{id}',
      tags,
    })
    .input(z.object({ id: z.string() }))
    .output(zCommute().extend({ stops: z.array(zStop()) }))
    .handler(async ({ context, input }) => {
      const commute = await context.db.commute.findFirst({
        where: {
          id: input.id,
          driver: { organizationId: context.organizationId },
        },
        include: { stops: true },
      });

      if (!commute) {
        throw new ORPCError('NOT_FOUND');
      }

      return commute;
    }),

  getByDate: organizationProcedure({
    permissions: {
      commute: ['read'],
    },
  })
    .route({
      method: 'GET',
      path: '/commutes/by-date',
      tags,
    })
    .input(z.object({ from: z.date(), to: z.date() }))
    .output(z.array(zCommuteEnriched()))
    .handler(async ({ context, input }) => {
      const commutes = await context.db.commute.findMany({
        where: {
          date: { gte: input.from, lt: input.to },
          driver: { organizationId: context.organizationId },
        },
        orderBy: { date: 'asc' },
        include: {
          driver: {
            include: {
              user: {
                select: { id: true, name: true, image: true, phone: true },
              },
            },
          },
          stops: {
            orderBy: { order: 'asc' },
            include: {
              location: { select: { id: true, name: true } },
              passengers: {
                include: {
                  passenger: {
                    include: {
                      user: {
                        select: {
                          id: true,
                          name: true,
                          image: true,
                          phone: true,
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

      return commutes.map((c) => ({
        ...c,
        driver: c.driver.user,
        stops: c.stops.map((s) => ({
          ...s,
          passengers: s.passengers.map((p) => ({
            ...p,
            passenger: p.passenger.user,
          })),
        })),
      }));
    }),

  getMyCommutes: organizationProcedure({
    permissions: {
      commute: ['read'],
    },
  })
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
        driver: { organizationId: context.organizationId },
        date: { gte: today },
        OR: [
          { driverMemberId: context.memberId },
          {
            stops: {
              some: {
                passengers: {
                  some: {
                    passengerMemberId: context.memberId,
                    status: 'ACCEPTED',
                  },
                },
              },
            },
          },
        ],
      } satisfies Prisma.CommuteWhereInput;

      const include = {
        driver: {
          include: {
            user: {
              select: { id: true, name: true, image: true, phone: true },
            },
          },
        },
        stops: {
          orderBy: { order: 'asc' as const },
          include: {
            location: { select: { id: true, name: true } },
            passengers: {
              include: {
                passenger: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        image: true,
                        phone: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      } satisfies Prisma.CommuteInclude;

      const [total, rawItems] = await Promise.all([
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
      if (rawItems.length > input.limit) {
        const nextItem = rawItems.pop();
        nextCursor = nextItem?.id;
      }

      const items = rawItems.map((c) => ({
        ...c,
        driver: c.driver.user,
        stops: c.stops.map((s) => ({
          ...s,
          passengers: s.passengers.map((p) => ({
            ...p,
            passenger: p.passenger.user,
          })),
        })),
      }));

      return { items, nextCursor, total };
    }),

  update: organizationProcedure({
    permissions: {
      commute: ['update'],
    },
  })
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
        where: {
          id: input.id,
          driver: { organizationId: context.organizationId },
        },
      });

      if (!existing) {
        throw new ORPCError('NOT_FOUND');
      }

      if (existing.driverMemberId !== context.memberId) {
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
      });

      for (const booking of affectedPassengers) {
        const passengerUser = booking.passenger.user;
        context.notify({
          type: 'commute.updated',
          recipient: {
            userId: passengerUser.id,
            name: passengerUser.name,
            email: passengerUser.email,
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

  cancel: organizationProcedure({
    permissions: {
      commute: ['delete'],
    },
  })
    .route({
      method: 'POST',
      path: '/commutes/{id}/cancel',
      tags,
    })
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      const existing = await context.db.commute.findFirst({
        where: {
          id: input.id,
          driver: { organizationId: context.organizationId },
        },
      });

      if (!existing) {
        throw new ORPCError('NOT_FOUND');
      }

      if (existing.driverMemberId !== context.memberId) {
        throw new ORPCError('FORBIDDEN');
      }

      const affectedPassengers = await context.db.passengersOnStops.findMany({
        where: {
          stop: { commuteId: input.id },
          status: { in: ['REQUESTED', 'ACCEPTED'] },
        },
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
        },
      });

      await context.db.commute.delete({
        where: { id: input.id },
      });

      for (const booking of affectedPassengers) {
        const passengerUser = booking.passenger.user;
        context.notify({
          type: 'commute.canceled',
          recipient: {
            userId: passengerUser.id,
            name: passengerUser.name,
            email: passengerUser.email,
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

  requestCommute: organizationProcedure()
    .route({
      method: 'POST',
      path: '/commutes/request',
      tags,
    })
    .input(z.object({ date: z.date(), destination: z.string().optional() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      const organization = await context.db.organization.findUnique({
        where: { id: context.organizationId },
        select: { slug: true },
      });

      if (!organization?.slug) {
        throw new ORPCError('NOT_FOUND');
      }

      context.notify({
        type: 'commute.requested',
        payload: {
          requesterName: context.user.name,
          requesterEmail: context.user.email,
          commuteDate: input.date,
          orgSlug: organization.slug,
          locationName: input.destination || undefined,
        },
      });
    }),
};
