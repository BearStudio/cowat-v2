import type { AppDB } from '@/server/db';
import type { CommuteType, RequestStatus } from '@/server/db/generated/client';

const enrichedCommuteInclude = {
  driver: {
    include: {
      user: { select: { id: true, name: true, image: true, phone: true } },
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
                select: { id: true, name: true, image: true, phone: true },
              },
            },
          },
        },
      },
    },
  },
} as const;

type StopCreateInput = {
  order: number;
  outwardTime: string;
  inwardTime?: string | null;
  locationId: string;
};

export const createCommuteRepository = (db: AppDB) => ({
  create: (data: {
    date: Date;
    seats: number;
    type: CommuteType;
    comment?: string | null;
    driverMemberId: string;
    stops: { create: StopCreateInput[] };
  }) => db.commute.create({ data, include: { stops: true } }),

  findById: (id: string, organizationId: string) =>
    db.commute.findFirst({
      where: { id, driver: { organizationId } },
      include: { stops: true },
    }),

  findByDateRange: async (params: {
    from: Date;
    to: Date;
    organizationId: string;
  }) => {
    const commutes = await db.commute.findMany({
      where: {
        date: { gte: params.from, lt: params.to },
        driver: { organizationId: params.organizationId },
      },
      orderBy: { date: 'asc' },
      include: enrichedCommuteInclude,
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
  },

  findMyPaginated: async (params: {
    memberId: string;
    organizationId: string;
    fromDate: Date;
    cursor?: string;
    limit: number;
  }) => {
    const where = {
      driver: { organizationId: params.organizationId },
      date: { gte: params.fromDate },
      OR: [
        { driverMemberId: params.memberId },
        {
          stops: {
            some: {
              passengers: {
                some: {
                  passengerMemberId: params.memberId,
                  status: 'ACCEPTED' as RequestStatus,
                },
              },
            },
          },
        },
      ],
    };

    const [total, rawItems] = await Promise.all([
      db.commute.count({ where }),
      db.commute.findMany({
        take: params.limit + 1,
        cursor: params.cursor ? { id: params.cursor } : undefined,
        orderBy: { date: 'asc' },
        where,
        include: enrichedCommuteInclude,
      }),
    ]);

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

    return { total, items };
  },

  findForMutation: (id: string, organizationId: string) =>
    db.commute.findFirst({
      where: { id, driver: { organizationId } },
    }),

  update: (
    id: string,
    data: {
      seats?: number;
      type?: CommuteType;
      comment?: string | null;
      stops?: { deleteMany: object; create: StopCreateInput[] };
    }
  ) => db.commute.update({ where: { id }, data, include: { stops: true } }),

  delete: (id: string) => db.commute.delete({ where: { id } }),
});

export type CommuteRepository = ReturnType<typeof createCommuteRepository>;
