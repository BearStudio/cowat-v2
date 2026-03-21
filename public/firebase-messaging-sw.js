// Minimal push notification service worker.
// No Firebase SDK needed — the client-side SDK (getToken) handles the push
// subscription via the standard Web Push API. This SW only needs to display
// incoming notifications and handle clicks.

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) { event.waitUntil(clients.claim()); });

self.addEventListener('push', function (event) {
  if (!event.data) return;

  var payload;
  try {
    payload = event.data.json();
  } catch (_e) {
    return;
  }

  var notification = payload.notification || {};
  var data = payload.data || {};
  var link =
    (payload.fcmOptions && payload.fcmOptions.link) ||
    data['gcm.notification.link'] ||
    notification.click_action ||
    '/';

  event.waitUntil(
    self.registration.showNotification(notification.title || 'Notification', {
      body: notification.body || '',
      icon: notification.icon || '/android-chrome-192x192.png',
      data: { link: link },
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var link = (event.notification.data && event.notification.data.link) || '/';
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          if (clientList[i].url === link && 'focus' in clientList[i]) return clientList[i].focus();
        }
        if (clients.openWindow) return clients.openWindow(link);
      })
  );
});
