import type { AppDB } from '@/server/db';

export const createFcmTokenRepository = (db: AppDB) => ({
  upsertToken: (userId: string, token: string) =>
    db.fcmToken.upsert({
      where: { token },
      update: { userId, updatedAt: new Date() },
      create: { userId, token },
    }),

  getTokensForUser: (userId: string) =>
    db.fcmToken.findMany({
      where: { userId },
      select: { id: true, token: true },
    }),

  deleteOldestTokensForUser: async (userId: string, keep: number) => {
    const tokens = await db.fcmToken.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true },
      skip: keep,
    });
    if (tokens.length === 0) return;
    await db.fcmToken.deleteMany({
      where: { id: { in: tokens.map((t) => t.id) } },
    });
  },

  deleteToken: (token: string) =>
    db.fcmToken.delete({ where: { token } }).catch((error: unknown) => {
      if (error instanceof Object && 'code' in error && error.code === 'P2025')
        return;
      throw error;
    }),

  deleteByIds: (ids: string[]) =>
    db.fcmToken.deleteMany({ where: { id: { in: ids } } }),
});
