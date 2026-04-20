import type { AppDB } from '@/server/db';
import type { Prisma, UserRole } from '@/server/db/generated/client';

export const createUserRepository = (db: AppDB) => ({
  findPaginated: (opts: {
    searchTerm?: string;
    organizationId?: string;
    cursor?: string;
    limit: number;
  }) => {
    const where = {
      AND: [
        ...(opts.organizationId
          ? [{ members: { some: { organizationId: opts.organizationId } } }]
          : []),
        {
          OR: [
            {
              name: {
                contains: opts.searchTerm ?? '',
                mode: 'insensitive' as const,
              },
            },
            {
              email: {
                contains: opts.searchTerm ?? '',
                mode: 'insensitive' as const,
              },
            },
          ],
        },
      ],
    } satisfies Prisma.UserWhereInput;

    return db.user.findManyPaginated(
      {
        orderBy: { name: 'asc' },
        where,
        include: {
          members: {
            select: {
              organization: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      },
      opts
    );
  },

  findById: (id: string) => db.user.findUnique({ where: { id } }),

  getEmail: (id: string) =>
    db.user.findUnique({ where: { id }, select: { email: true } }),

  update: (id: string, data: Prisma.UserUpdateInput) =>
    db.user.update({ where: { id }, data }),

  create: (data: {
    email: string;
    emailVerified: boolean;
    name: string;
    role?: UserRole;
  }) => db.user.create({ data }),

  findSessionsPaginated: (
    userId: string,
    opts: { cursor?: string; limit: number }
  ) =>
    db.session.findManyPaginated(
      {
        orderBy: { createdAt: 'desc' },
        where: { userId },
      },
      opts
    ),
});
