importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Fetch Firebase config from the server — avoids hardcoding credentials in the repo.
const configPromise = fetch('/api/firebase-config')
  .then(function (r) { return r.json(); })
  .then(function (config) {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    return firebase.messaging();
  });

// onBackgroundMessage is only needed for data-only messages (no notification payload).
// For messages with a notification payload, the FCM SDK displays the notification automatically.
configPromise.then(function (messaging) {
  messaging.onBackgroundMessage(function (_payload) {});
});

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) { event.waitUntil(clients.claim()); });

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const link =
    event.notification?.data?.['gcm.notification.link'] ??
    event.notification?.data?.link ??
    '/';
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        for (const client of clientList) {
          if (client.url === link && 'focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(link);
      }),
  );
});
