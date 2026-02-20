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

    return Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        take: opts.limit + 1,
        cursor: opts.cursor ? { id: opts.cursor } : undefined,
        orderBy: { name: 'asc' },
        where,
        include: {
          members: {
            select: {
              organization: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      }),
    ]);
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
    Promise.all([
      db.session.count({ where: { userId } }),
      db.session.findMany({
        take: opts.limit + 1,
        cursor: opts.cursor ? { id: opts.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        where: { userId },
      }),
    ]),
});

export type UserRepository = ReturnType<typeof createUserRepository>;
