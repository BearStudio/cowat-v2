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

  deleteToken: (token: string) =>
    db.fcmToken.delete({ where: { token } }).catch(() => {
      // Ignore if token doesn't exist
    }),

  deleteTokenById: (id: string) =>
    db.fcmToken.delete({ where: { id } }).catch(() => {
      // Ignore if token doesn't exist
    }),
});
