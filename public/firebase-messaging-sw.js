// Minimal push notification service worker.
// Source: src/features/push/service-worker/firebase-messaging-sw.ts
// No Firebase SDK needed — the client-side SDK handles the push subscription.

const sw = globalThis;

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

  let payload;
  try {
    payload = event.data.json();
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
  const link = event.notification.data?.link ?? '/';

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
