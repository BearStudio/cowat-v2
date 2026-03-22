import { envServer } from '@/env/server';
import { isFirebaseConfigured, sendFcmMessage } from '@/server/firebase';

import type { NotificationChannel, NotificationEvent } from '../types';

type PushContent = {
  title: string;
  body: string;
  link?: string;
};

// Notification messages and formatting are intentionally in French — the app
// currently targets a French-speaking audience exclusively.
function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function getContentForEvent(event: NotificationEvent): PushContent | null {
  switch (event.type) {
    case 'booking.requested':
      return {
        title: 'Nouvelle demande de covoiturage',
        body: `${event.payload.passengerName} souhaite rejoindre votre trajet du ${formatDate(event.payload.commuteDate)}`,
        link: `${envServer.VITE_BASE_URL}/${event.payload.orgSlug}`,
      };
    case 'booking.accepted':
      return {
        title: 'Réservation acceptée',
        body: `${event.payload.driverName} a accepté votre demande pour le ${formatDate(event.payload.commuteDate)}`,
        link: `${envServer.VITE_BASE_URL}/${event.payload.orgSlug}`,
      };
    case 'booking.refused':
      return {
        title: 'Réservation refusée',
        body: `${event.payload.driverName} a refusé votre demande pour le ${formatDate(event.payload.commuteDate)}`,
        link: `${envServer.VITE_BASE_URL}/${event.payload.orgSlug}`,
      };
    case 'booking.canceled':
      return {
        title: 'Réservation annulée',
        body: `${event.payload.passengerName} a annulé sa réservation pour le ${formatDate(event.payload.commuteDate)}`,
        link: `${envServer.VITE_BASE_URL}/${event.payload.orgSlug}`,
      };
    case 'commute.updated':
      return {
        title: 'Trajet modifié',
        body: `${event.payload.driverName} a modifié son trajet du ${formatDate(event.payload.commuteDate)}`,
        link: `${envServer.VITE_BASE_URL}/${event.payload.orgSlug}`,
      };
    case 'commute.canceled':
      return {
        title: 'Trajet annulé',
        body: `${event.payload.driverName} a annulé son trajet du ${formatDate(event.payload.commuteDate)}`,
        link: `${envServer.VITE_BASE_URL}/${event.payload.orgSlug}`,
      };
    // Broadcast events — no direct recipient, skip push
    case 'commute.created':
    case 'commute.requested':
      return null;
  }
}

export const pushChannel: NotificationChannel = {
  name: 'push',

  canSend(event) {
    if (!('recipient' in event)) return false;
    return isFirebaseConfigured();
  },

  async send(event, logger, orgContext) {
    if (!orgContext) {
      logger.warn('Push: send() called without orgContext, skipping');
      return;
    }

    const content = getContentForEvent(event);
    if (!content) return;

    const recipient = 'recipient' in event ? event.recipient : null;
    if (!recipient) return;

    const tokens = await orgContext.db.fcmToken.findMany({
      where: { userId: recipient.userId },
      select: { id: true, token: true },
    });

    if (!tokens.length) return;

    const results = await Promise.allSettled(
      tokens.map(async (t) => {
        const result = await sendFcmMessage({
          token: t.token,
          notification: {
            title: content.title,
            body: content.body,
          },
          webpush: {
            notification: { icon: '/android-chrome-192x192.png' },
            fcmOptions: content.link ? { link: content.link } : undefined,
          },
        });
        return { result, tokenRecord: t };
      })
    );

    const invalidTokenIds: string[] = [];
    let failedCount = 0;
    const errors: Array<{ code: string; message: string; token: string }> = [];

    for (const settled of results) {
      if (settled.status === 'rejected') {
        failedCount++;
        continue;
      }
      const { result, tokenRecord } = settled.value;
      if (!result.success && result.error) {
        failedCount++;
        errors.push({
          code: result.error.code,
          message: result.error.message,
          token: tokenRecord.token.slice(0, 20),
        });
        if (
          result.error.status === 'NOT_FOUND' ||
          result.error.status === 'UNREGISTERED'
        ) {
          invalidTokenIds.push(tokenRecord.id);
        }
      }
    }

    if (invalidTokenIds.length > 0) {
      await orgContext.db.fcmToken.deleteMany({
        where: { id: { in: invalidTokenIds } },
      });
      logger.info(
        { count: invalidTokenIds.length },
        'Push: removed invalid FCM tokens'
      );
    }

    if (failedCount > 0) {
      logger.warn(
        { failedCount, successCount: tokens.length - failedCount, errors },
        'Push: some notifications failed to send'
      );
    }
  },
};
