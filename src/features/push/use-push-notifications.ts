import { useEffect, useRef } from 'react';

import { orpcClient } from '@/lib/orpc/client';

import {
  getClientMessaging,
  getFcmToken,
  isPushSupported,
  onMessage,
} from './firebase-client';

/**
 * Requests push notification permission, registers the FCM token with the
 * server, and listens for foreground messages (which are not shown
 * automatically by the browser — you can handle them here if needed).
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
        console.debug('[FCM] Requesting notification permission...');
      const permission = await Notification.requestPermission();
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
