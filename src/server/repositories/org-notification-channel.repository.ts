import type { AppDB } from '@/server/db';
import type { NotificationChannelType } from '@/server/db/generated/client';
import { decrypt, encrypt } from '@/server/encryption';

function encryptField(value: string | null): string | null {
  return value ? encrypt(value) : null;
}

function decryptField(value: string | null): string | null {
  return value ? decrypt(value) : null;
}

export const createOrgNotificationChannelRepository = (db: AppDB) => ({
  findByOrgAndType: async (orgId: string, type: NotificationChannelType) => {
    const row = await db.orgNotificationChannel.findUnique({
      where: { orgId_type: { orgId, type } },
    });

    if (!row) return null;

    return {
      ...row,
      token: decryptField(row.token),
      broadcastChannel: decryptField(row.broadcastChannel),
    };
  },

  upsert: (params: {
    orgId: string;
    type: NotificationChannelType;
    enabled: boolean;
    token: string | null;
    broadcastChannel: string | null;
    locale: string | null;
  }) =>
    db.orgNotificationChannel.upsert({
      where: { orgId_type: { orgId: params.orgId, type: params.type } },
      update: {
        enabled: params.enabled,
        token: encryptField(params.token),
        broadcastChannel: encryptField(params.broadcastChannel),
        locale: params.locale,
      },
      create: {
        orgId: params.orgId,
        type: params.type,
        enabled: params.enabled,
        token: encryptField(params.token),
        broadcastChannel: encryptField(params.broadcastChannel),
        locale: params.locale,
      },
    }),
});
