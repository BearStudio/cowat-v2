import { useEffect, useRef } from 'react';

import { orpcClient } from '@/lib/orpc/client';

import {
  getClientMessaging,
  getFcmToken,
  isPushSupported,
  onMessage,
} from './firebase-client';

/**
 * Registers the FCM token with the server if notification permission is
 * already granted, and listens for foreground messages (which are not shown
 * automatically by the browser — you can handle them here if needed).
 *
 * This hook does NOT request permission — that must happen from a user
 * interaction (e.g. push-notification-toggle.tsx).
 *
 * Call this hook once in an authenticated layout component.
 */
export function usePushNotifications() {
  const isSupported = isPushSupported();
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isSupported) return;

    async function setup() {
      if (import.meta.env.DEV)
        console.debug('[FCM] Checking notification permission...');
      const permission = Notification.permission;
      if (import.meta.env.DEV) console.debug('[FCM] Permission:', permission);
      if (permission !== 'granted') return;

      const token = await getFcmToken().catch((err) => {
        if (import.meta.env.DEV)
          console.error('[FCM] Failed to get token:', err);
        return null;
      });
      if (!token || token === tokenRef.current) return;

      tokenRef.current = token;
      await orpcClient.account.toggleFcmToken({ token, registered: true });
      if (import.meta.env.DEV)
        console.debug('[FCM] Token registered successfully');
    }

    setup().catch(console.error);
  }, [isSupported]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    getClientMessaging()
      .then((messaging) => {
        if (!messaging) return;
        unsubscribe = onMessage(messaging, (payload) => {
          if (import.meta.env.DEV)
            console.info('[FCM] Foreground message', payload);
        });
      })
      .catch(() => {
        // Push notifications not supported in this context
      });

    return () => unsubscribe?.();
  }, []);

  return { isSupported };
}
