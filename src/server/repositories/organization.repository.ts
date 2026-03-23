import type { AppDB } from '@/server/db';
import type { Prisma } from '@/server/db/generated/client';

export const createOrganizationRepository = (db: AppDB) => ({
  findPaginated: (opts: {
    searchTerm?: string;
    cursor?: string;
    limit: number;
  }) => {
    const where = {
      OR: [
        {
          name: {
            contains: opts.searchTerm ?? '',
            mode: 'insensitive' as const,
          },
        },
        {
          slug: {
            contains: opts.searchTerm ?? '',
            mode: 'insensitive' as const,
          },
        },
      ],
    } satisfies Prisma.OrganizationWhereInput;

    return Promise.all([
      db.organization.count({ where }),
      db.organization.findMany({
        take: opts.limit + 1,
        cursor: opts.cursor ? { id: opts.cursor } : undefined,
        orderBy: { name: 'asc' },
        where,
        include: { _count: { select: { members: true } } },
      }),
    ]);
  },

  findMemberById: (memberId: string, organizationId: string) =>
    db.member.findFirst({
      where: { id: memberId, organizationId },
    }),

  updateMemberRole: (memberId: string, role: 'owner' | 'member') =>
    db.member.update({
      where: { id: memberId },
      data: { role },
    }),

  findByIdWithDetails: (id: string) =>
    db.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        invitations: {
          where: { status: 'pending' },
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            expiresAt: true,
          },
        },
      },
    }),

  findMyMemberships: (userId: string) =>
    db.member.findMany({
      where: { userId },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, logo: true },
        },
      },
    }),

  findOwnerMembership: (userId: string, organizationId: string) =>
    db.member.findFirst({
      where: { userId, organizationId, role: { in: ['owner', 'admin'] } },
    }),

  findById: (id: string) => db.organization.findUnique({ where: { id } }),

  findSlugById: (id: string) =>
    db.organization.findUnique({ where: { id }, select: { slug: true } }),

  update: (id: string, data: { name: string }) =>
    db.organization.update({ where: { id }, data }),

  delete: (id: string) => db.organization.delete({ where: { id } }),
});
