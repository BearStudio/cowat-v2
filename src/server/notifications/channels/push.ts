import type { LanguageKey } from '@/lib/i18n/constants';
import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

import { envClient } from '@/env/client';
import { getPushContent } from '@/features/push/templates';
import {
  type FcmMessage,
  getAccessToken,
  isConfigured,
  postMessage,
} from '@/server/firebase';
import { createFcmTokenRepository } from '@/server/repositories/fcm-token.repository';

import type { EventWithRecipient, NotificationChannel } from '../types';

async function sendEach(
  accessToken: string,
  messages: FcmMessage[]
): Promise<{
  failedTokens: string[];
  invalidTokens: string[];
}> {
  const settled = await Promise.allSettled(
    messages.map(async (message) => {
      const result = await postMessage(accessToken, message);
      return { token: message.token, result };
    })
  );

  const failedTokens: string[] = [];
  const invalidTokens: string[] = [];

  for (const [index, entry] of settled.entries()) {
    if (entry.status === 'rejected') {
      failedTokens.push(messages[index]!.token);
      continue;
    }

    const { token, result } = entry.value;
    if (result.isOk()) continue;

    const { status } = result.error;
    if (status === 'NOT_FOUND' || status === 'UNREGISTERED') {
      invalidTokens.push(token);
    } else {
      failedTokens.push(token);
    }
  }

  return { failedTokens, invalidTokens };
}

export const pushChannel: NotificationChannel = {
  name: 'push',

  canSend(event) {
    if (!('recipient' in event)) return false;
    return isConfigured();
  },

  async send(event, logger, orgContext) {
    if (!orgContext) {
      logger.warn('Push: send() called without orgContext, skipping');
      return;
    }

    const orgChannel = await orgContext.db.orgNotificationChannel.findUnique({
      where: {
        orgId_type: { orgId: orgContext.organizationId, type: 'PUSH' },
      },
      select: { locale: true },
    });
    const locale =
      (orgChannel?.locale as LanguageKey | null) ?? DEFAULT_LANGUAGE_KEY;

    const content = getPushContent(event, locale, envClient.VITE_BASE_URL);
    if (!content) return;

    // canSend() guarantees 'recipient' exists — narrow the type
    if (!('recipient' in event)) return;
    const { recipient } = event as EventWithRecipient;

    const fcmTokens = createFcmTokenRepository(orgContext.db);
    const tokens = await fcmTokens.getTokensForUser(recipient.userId);

    if (!tokens.length) return;

    const accessTokenResult = await getAccessToken();
    if (accessTokenResult.isErr()) {
      logger.error(
        { err: accessTokenResult.error },
        'Push: failed to get access token'
      );
      return;
    }

    const messages: FcmMessage[] = tokens.map((t) => ({
      token: t.token,
      notification: { title: content.title, body: content.body },
      webpush: {
        notification: { icon: '/android-chrome-192x192.png' },
        fcmOptions: content.link ? { link: content.link } : undefined,
      },
    }));

    const { failedTokens, invalidTokens } = await sendEach(
      accessTokenResult.value,
      messages
    );

    // Clean up expired registrations
    if (invalidTokens.length > 0) {
      const tokenToId = new Map(tokens.map((t) => [t.token, t.id]));
      const invalidTokenIds = invalidTokens
        .map((t) => tokenToId.get(t))
        .filter((id): id is string => id !== undefined);

      if (invalidTokenIds.length > 0) {
        await fcmTokens.deleteByIds(invalidTokenIds);
        logger.info(
          { count: invalidTokenIds.length },
          'Push: removed invalid FCM tokens'
        );
      }
    }

    if (failedTokens.length > 0) {
      logger.warn(
        {
          failedCount: failedTokens.length,
          successCount: messages.length - failedTokens.length,
        },
        'Push: some notifications failed to send'
      );
    }
  },
};
