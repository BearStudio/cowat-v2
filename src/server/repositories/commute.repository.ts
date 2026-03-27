import type { AppDB } from '@/server/db';
import {
  type CommuteType,
  type Prisma,
  type RequestStatus,
} from '@/server/db/generated/client';

import { enrichedCommuteInclude, flattenEnrichedCommute } from './helpers';
import type { StopCreateInput } from './types';

export const createCommuteRepository = (db: AppDB) => ({
  create: (data: {
    date: Date;
    seats: number;
    type: CommuteType;
    comment?: string | null;
    driverMemberId: string;
    stops: { create: StopCreateInput[] };
  }) =>
    db.commute.create({
      data,
      include: {
        stops: {
          orderBy: { order: 'asc' as const },
          include: { location: { select: { name: true, address: true } } },
        },
      },
    }),

  findById: (id: string, organizationId: string) =>
    db.commute.findFirst({
      where: { id, driver: { organizationId } },
      include: { stops: true },
    }),

  findByIdEnriched: async (id: string, organizationId: string) => {
    const commute = await db.commute.findFirst({
      where: { id, driver: { organizationId } },
      include: enrichedCommuteInclude,
    });
    return commute ? flattenEnrichedCommute(commute) : null;
  },

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
    return commutes.map(flattenEnrichedCommute);
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

    const [total, rawItems] = await db.commute.findManyPaginated(
      {
        orderBy: { date: 'asc' },
        where,
        include: enrichedCommuteInclude,
      },
      params
    );

    const items = rawItems.map(flattenEnrichedCommute);

    return { total, items };
  },

  // Intentionally omits include — only needs driverMemberId for authorization
  findForMutation: (id: string, organizationId: string) =>
    db.commute.findFirst({
      where: { id, driver: { organizationId } },
    }),

  update: async (
    id: string,
    data: {
      seats?: number;
      type?: CommuteType;
      comment?: string | null;
      stops?: StopCreateInput[];
    }
  ) => {
    const { stops, ...fields } = data;

    if (!stops) {
      return db.commute.update({
        where: { id },
        data: fields,
        include: { stops: true },
      });
    }

    const existingStops = await db.stop.findMany({
      where: { commuteId: id },
      orderBy: { order: 'asc' },
      select: { id: true },
    });

    const stopsToDelete = existingStops.slice(stops.length);

    return db.commute.update({
      where: { id },
      data: {
        ...fields,
        stops: ({
	...stopsToDelete.length > 0 && { deleteMany: { id: { in: stopsToDelete.map((s) => s.id) } } },
	update: stops.slice(0, existingStops.length).map((stop, i) => ({
		where: { id: existingStops[i]!.id },
		data: stop
	})),
	...stops.length > existingStops.length && { create: stops.slice(existingStops.length) }
}),
      },
      include: { stops: true },
    });
  },

  delete: (id: string) => db.commute.delete({ where: { id } }),

  /**
   * Returns all commutes in [from, to[ across every organization.
   * For each commute, includes:
   * - The driver (userId, name, email, org info)
   * - Only ACCEPTED passengers on each stop (same fields as the driver)
   * When `includePreferences` is true, notification preferences are pre-filtered
   * to `{ enabled: true }` (enabled channels only).
   */
  findAllForRange: (
    from: Date,
    to: Date,
    options?: { includePreferences?: boolean }
  ) => {
    const memberSelect = {
      userId: true,
      user: { select: { name: true, email: true } },
      organizationId: true,
      organization: { select: { slug: true } },
      ...(options?.includePreferences && {
        notificationPreferences: {
          where: { enabled: true },
          select: { channel: true },
        },
      }),
    } satisfies Prisma.MemberSelect;

    return db.commute.findMany({
      where: { date: { gte: from, lt: to } },
      select: {
        id: true,
        date: true,
        driver: { select: memberSelect },
        stops: {
          select: {
            passengers: {
              where: { status: 'ACCEPTED' as RequestStatus },
              select: { passenger: { select: memberSelect } },
            },
          },
        },
      },
    });
  },
});
