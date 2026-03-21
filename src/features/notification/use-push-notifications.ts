import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { orpc } from '@/lib/orpc/client';

import { getClientMessaging, getFcmToken, onMessage } from './firebase-client';

/**
 * Requests push notification permission, registers the FCM token with the
 * server, and listens for foreground messages (which are not shown
 * automatically by the browser — you can handle them here if needed).
 *
 * Call this hook once in an authenticated layout component.
 */
export function usePushNotifications() {
  const registerToken = useMutation(
    orpc.account.registerFcmToken.mutationOptions()
  );
  const registerTokenRef = useRef(registerToken);
  registerTokenRef.current = registerToken;
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      !('serviceWorker' in navigator)
    ) {
      return;
    }

    async function setup() {
      console.debug('[FCM] Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.debug('[FCM] Permission:', permission);
      if (permission !== 'granted') return;

      const token = await getFcmToken().catch((err) => {
        console.error('[FCM] Failed to get token:', err);
        return null;
      });
      if (!token || token === tokenRef.current) return;

      if (import.meta.env.DEV) {
        console.info(
          '%c[FCM] Token (click to copy) %c' + token,
          'color: #666',
          'color: #0a84ff; cursor: pointer; user-select: all'
        );
        (window as unknown as Record<string, unknown>).fcmToken = token;
        console.info('[FCM] Also available as window.fcmToken');
      }

      tokenRef.current = token;
      await registerTokenRef.current.mutateAsync({ token });
      console.debug('[FCM] Token registered successfully');
    }

    setup().catch(console.error);
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    getClientMessaging()
      .then((messaging) => {
        if (!messaging) return;
        unsubscribe = onMessage(messaging, (payload) => {
          console.info('[FCM] Foreground message', payload);
        });
      })
      .catch(() => {
        // Push notifications not supported in this context
      });

    return () => unsubscribe?.();
  }, []);
}
