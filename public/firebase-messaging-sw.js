importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Fetch Firebase config and initialise messaging BEFORE the SW activates.
// This guarantees firebase.messaging() is ready when the client calls getToken().
var messagingReady = fetch('/api/firebase-config')
  .then(function (r) { return r.json(); })
  .then(function (config) {
    firebase.initializeApp(config);
    var messaging = firebase.messaging();
    // onBackgroundMessage is only needed for data-only messages (no notification payload).
    // Messages with a notification payload are displayed automatically by the FCM SDK.
    messaging.onBackgroundMessage(function (_payload) {});
    return messaging;
  });

// Block installation until Firebase is fully initialised.
self.addEventListener('install', function (event) {
  event.waitUntil(messagingReady.then(function () { self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(clients.claim());
});

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
