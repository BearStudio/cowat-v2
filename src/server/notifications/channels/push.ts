import type { MulticastMessage } from 'firebase-admin/messaging';

import { envServer } from '@/env/server';
import { getFirebaseMessaging } from '@/server/firebase';

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

  async canSend(event) {
    // Broadcast events have no recipient
    if (!('recipient' in event)) return false;
    try {
      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        console.warn('Push canSend: getFirebaseMessaging() returned null');
      }
      return messaging !== null;
    } catch (err) {
      console.error('Push canSend: getFirebaseMessaging() threw', err);
      return false;
    }
  },

  async send(event, logger, orgContext) {
    let messaging;
    try {
      messaging = await getFirebaseMessaging();
    } catch (err) {
      logger.warn({ err }, 'Push: failed to get Firebase messaging instance');
      return;
    }
    if (!messaging) return;
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

    const message: MulticastMessage = {
      tokens: tokens.map((t) => t.token),
      notification: {
        title: content.title,
        body: content.body,
      },
      webpush: {
        notification: {
          icon: '/android-chrome-192x192.png',
        },
        fcmOptions: content.link ? { link: content.link } : undefined,
      },
    };

    const response = await messaging.sendEachForMulticast(message);

    // Clean up invalid tokens
    const invalidTokenIds = response.responses
      .map((r, i) => ({ result: r, token: tokens[i]! }))
      .filter(
        ({ result }) =>
          !result.success &&
          (result.error?.code ===
            'messaging/registration-token-not-registered' ||
            result.error?.code === 'messaging/invalid-registration-token')
      )
      .map(({ token }) => token.id);

    if (invalidTokenIds.length > 0) {
      await orgContext.db.fcmToken.deleteMany({
        where: { id: { in: invalidTokenIds } },
      });
      logger.info(
        { count: invalidTokenIds.length },
        'Push: removed invalid FCM tokens'
      );
    }

    const failedCount = response.failureCount;
    if (failedCount > 0) {
      const errors = response.responses
        .map((r, i) => ({ ...r.error, token: tokens[i]?.token?.slice(0, 20) }))
        .filter((_, i) => !response.responses[i]!.success);
      logger.warn(
        { failedCount, successCount: response.successCount, errors },
        'Push: some notifications failed to send'
      );
    }
  },
};
