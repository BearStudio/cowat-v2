import { getTodayMidnight } from '@/lib/date';

import type { AppDB } from '@/server/db';
import type {
  CommuteRequestStatus,
  Prisma,
} from '@/server/db/generated/client';

import { userProfileSelect } from './helpers';

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

  findPaginated: (
    organizationId: string,
    opts: { cursor?: string; limit: number }
  ) => {
    const where = {
      date: { gte: getTodayMidnight() },
      status: 'OPEN' as CommuteRequestStatus,
      requester: { organizationId },
    } satisfies Prisma.CommuteRequestWhereInput;

    return db.commuteRequest.findManyPaginated(
      {
        orderBy: { date: 'asc' },
        where,
        include: {
          requester: {
            include: {
              user: { select: userProfileSelect },
            },
          },
        },
      },
      opts
    );
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
        date: { gte: getTodayMidnight() },
        status: 'OPEN',
        requester: { organizationId },
      },
    }),
});
