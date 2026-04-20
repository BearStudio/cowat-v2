import type { AppDB } from '@/server/db';
import type { CommuteType } from '@/server/db/generated/client';

import { stopsWithLocationInclude } from './helpers';
import type { StopCreateInput } from './types';

const templateWithLocationInclude = {
  stops: stopsWithLocationInclude,
} as const;

export const createCommuteTemplateRepository = (db: AppDB) => ({
  create: (data: {
    name: string;
    seats: number;
    type: CommuteType;
    comment?: string | null;
    driverMemberId: string;
    stops: { create: StopCreateInput[] };
  }) => db.commuteTemplate.create({ data, include: { stops: true } }),

  findPaginatedByMember: (
    memberId: string,
    opts: { cursor?: string; limit: number }
  ) =>
    db.commuteTemplate.findManyPaginated(
      {
        orderBy: { updatedAt: 'desc' },
        where: { driverMemberId: memberId },
        include: templateWithLocationInclude,
      },
      opts
    ),

  findById: (id: string, organizationId: string) =>
    db.commuteTemplate.findFirst({
      where: { id, driver: { organizationId } },
      include: templateWithLocationInclude,
    }),

  // Intentionally omits include — only needs driverMemberId for authorization
  findForMutation: (id: string, organizationId: string) =>
    db.commuteTemplate.findFirst({
      where: { id, driver: { organizationId } },
    }),

  update: (
    id: string,
    data: {
      name?: string;
      seats?: number;
      type?: CommuteType;
      comment?: string | null;
      stops?: { deleteMany: object; create: StopCreateInput[] };
    }
  ) =>
    db.commuteTemplate.update({
      where: { id },
      data,
      include: { stops: true },
    }),

  delete: (id: string) => db.commuteTemplate.delete({ where: { id } }),
});
