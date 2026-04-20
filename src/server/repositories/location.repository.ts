import type { AppDB } from '@/server/db';

export const createLocationRepository = (db: AppDB) => ({
  create: (data: {
    name: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
    memberId: string;
  }) => db.location.create({ data }),

  findPaginatedByMember: (
    memberId: string,
    opts: { cursor?: string; limit: number }
  ) =>
    db.location.findManyPaginated(
      {
        orderBy: { updatedAt: 'desc' },
        where: { memberId },
      },
      opts
    ),

  findByIdInOrg: (id: string, organizationId: string) =>
    db.location.findFirst({
      where: { id, member: { organizationId } },
    }),

  update: (id: string, data: { name?: string; address?: string }) =>
    db.location.update({ where: { id }, data }),

  delete: (id: string) => db.location.delete({ where: { id } }),
});
