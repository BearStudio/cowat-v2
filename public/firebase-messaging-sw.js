importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// importScripts is synchronous in service workers — config is available immediately.
importScripts('/api/firebase-config-sw');

firebase.initializeApp(self.firebaseConfig);

// firebase.messaging() registers push/pushsubscriptionchange event handlers
// internally — this MUST happen at top-level during initial script evaluation.
var messaging = firebase.messaging();

messaging.onBackgroundMessage(function (_payload) {});

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) { event.waitUntil(clients.claim()); });

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var link =
    event.notification?.data?.['gcm.notification.link'] ??
    event.notification?.data?.link ??
    '/';
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          if (clientList[i].url === link && 'focus' in clientList[i]) return clientList[i].focus();
        }
        if (clients.openWindow) return clients.openWindow(link);
      }),
  );
});
