import { getToday } from '@/lib/date';

import type { AppDB } from '@/server/db';
import type {
  CommuteRequestStatus,
  Prisma,
} from '@/server/db/generated/client';

export const createCommuteRequestRepository = (db: AppDB) => ({
  create: (data: {
    date: Date;
    destination?: string | null;
    comment?: string | null;
    requesterMemberId: string;
  }) => db.commuteRequest.create({ data }),

  findById: (id: string) =>
    db.commuteRequest.findUnique({
      where: { id },
      include: {
        requester: { select: { organizationId: true } },
      },
    }),

  findPaginated: async (
    organizationId: string,
    opts: { cursor?: string; limit: number }
  ) => {
    const where = {
      date: { gte: getToday() },
      status: 'OPEN' as CommuteRequestStatus,
      requester: { organizationId },
    } satisfies Prisma.CommuteRequestWhereInput;

    return Promise.all([
      db.commuteRequest.count({ where }),
      db.commuteRequest.findMany({
        take: opts.limit + 1,
        cursor: opts.cursor ? { id: opts.cursor } : undefined,
        orderBy: { date: 'asc' },
        where,
        include: {
          requester: {
            include: {
              user: {
                select: { id: true, name: true, image: true, phone: true },
              },
            },
          },
        },
      }),
    ]);
  },

  updateStatus: (id: string, status: CommuteRequestStatus) =>
    db.commuteRequest.update({ where: { id }, data: { status } }),

  fulfill: (id: string, commuteId: string) =>
    db.commuteRequest.update({
      where: { id },
      data: { status: 'FULFILLED', commuteId },
    }),

  fulfillMany: (ids: string[], commuteId: string, organizationId: string) =>
    db.commuteRequest.updateMany({
      where: {
        id: { in: ids },
        status: 'OPEN',
        requester: { organizationId },
      },
      data: { status: 'FULFILLED', commuteId },
    }),

  countOpen: (organizationId: string) =>
    db.commuteRequest.count({
      where: {
        date: { gte: getToday() },
        status: 'OPEN',
        requester: { organizationId },
      },
    }),
});
