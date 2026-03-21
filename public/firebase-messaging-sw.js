importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({"apiKey":"AIzaSyAgRFW5lUGM7yoF4T8El6FSyAIEIH3UlRA","authDomain":"cowat-cf836.firebaseapp.com","projectId":"cowat-cf836","storageBucket":"cowat-cf836.firebasestorage.app","messagingSenderId":"882964915286","appId":"1:882964915286:web:3ec86bf4ead6dae55f07f7"});

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) { event.waitUntil(clients.claim()); });

const messaging = firebase.messaging();

// onBackgroundMessage is only needed for data-only messages (no notification payload).
// For messages with a notification payload, the FCM SDK displays the notification automatically.
messaging.onBackgroundMessage(function (_payload) {});

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
