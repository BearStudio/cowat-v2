/// <reference lib="webworker" />

// Minimal push notification service worker.
// No Firebase SDK needed — the client-side SDK (getToken) handles the push
// subscription via the standard Web Push API. This SW only needs to display
// incoming notifications and handle clicks.

export type {};

const sw = globalThis as unknown as ServiceWorkerGlobalScope;

type FcmPushPayload = {
  notification?: {
    title?: string;
    body?: string;
    icon?: string;
    click_action?: string;
  };
  data?: Record<string, string>;
  fcmOptions?: { link?: string };
};

sw.addEventListener('install', () => {
  console.log('[SW] Installing');
  sw.skipWaiting();
});

sw.addEventListener('activate', (event) => {
  console.log('[SW] Activating');
  event.waitUntil(sw.clients.claim());
});

sw.addEventListener('push', (event) => {
  console.log(
    '[SW] Push event received',
    event.data ? event.data.text() : 'no data'
  );

  if (!event.data) return;

  let payload: FcmPushPayload;
  try {
    payload = event.data.json() as FcmPushPayload;
  } catch {
    console.warn('[SW] Failed to parse push data as JSON');
    return;
  }

  console.log('[SW] Push payload:', JSON.stringify(payload));

  const notification = payload.notification ?? {};
  const data = payload.data ?? {};
  const link =
    payload.fcmOptions?.link ??
    data['gcm.notification.link'] ??
    notification.click_action ??
    '/';

  event.waitUntil(
    sw.registration.showNotification(notification.title ?? 'Notification', {
      body: notification.body ?? '',
      icon: notification.icon ?? '/android-chrome-192x192.png',
      data: { link },
    })
  );
});

sw.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link =
    (event.notification.data as { link?: string } | undefined)?.link ?? '/';

  event.waitUntil(
    sw.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === link && 'focus' in client) {
            return client.focus();
          }
        }
        return sw.clients.openWindow(link);
      })
  );
});
