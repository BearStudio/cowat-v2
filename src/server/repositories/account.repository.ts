import type { AppDB } from '@/server/db';
import type { NotificationChannelType } from '@/server/db/generated/client';

export const createAccountRepository = (db: AppDB) => ({
  updateUser: (
    userId: string,
    data: Parameters<AppDB['user']['update']>[0]['data']
  ) => db.user.update({ where: { id: userId }, data }),

  getMemberAutoAccept: (memberId: string) =>
    db.member.findUniqueOrThrow({
      where: { id: memberId },
      select: { autoAccept: true },
    }),

  updateMemberAutoAccept: (memberId: string, autoAccept: boolean) =>
    db.member.update({
      where: { id: memberId },
      data: { autoAccept },
    }),

  getNotificationPreferences: (memberId: string) =>
    db.notificationPreference.findMany({
      where: { memberId },
      select: { channel: true, enabled: true },
    }),

  upsertNotificationPreference: (params: {
    memberId: string;
    channel: NotificationChannelType;
    enabled: boolean;
  }) =>
    db.notificationPreference.upsert({
      where: {
        memberId_channel: {
          memberId: params.memberId,
          channel: params.channel,
        },
      },
      update: { enabled: params.enabled },
      create: {
        memberId: params.memberId,
        channel: params.channel,
        enabled: params.enabled,
      },
    }),
});
