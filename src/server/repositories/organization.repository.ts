import type { AppDB } from '@/server/db';
import type { Prisma } from '@/server/db/generated/client';

import { userCardSelect } from './helpers';

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

    return db.organization.findManyPaginated(
      {
        orderBy: { name: 'asc' },
        where,
        include: { _count: { select: { members: true } } },
      },
      opts
    );
  },

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
            user: { select: userCardSelect },
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

  searchUsersByEmail: (opts: {
    email: string;
    organizationId: string;
    limit: number;
  }) =>
    db.user.findMany({
      where: {
        email: { contains: opts.email, mode: 'insensitive' },
        members: { none: { organizationId: opts.organizationId } },
      },
      select: userCardSelect,
      take: opts.limit,
      orderBy: { email: 'asc' },
    }),

  findById: (id: string) => db.organization.findUnique({ where: { id } }),

  findSlugById: (id: string) =>
    db.organization.findUnique({ where: { id }, select: { slug: true } }),

  update: (id: string, data: { name: string }) =>
    db.organization.update({ where: { id }, data }),

  delete: (id: string) => db.organization.delete({ where: { id } }),
});
