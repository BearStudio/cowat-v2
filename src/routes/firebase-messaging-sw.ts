import { createFileRoute } from '@tanstack/react-router';

import { envServer } from '@/env/server';

const FIREBASE_VERSION = '10.7.1';

function buildSwScript() {
  const config = JSON.stringify({
    apiKey: envServer.FIREBASE_API_KEY,
    authDomain: envServer.FIREBASE_AUTH_DOMAIN,
    projectId: envServer.FIREBASE_PROJECT_ID,
    storageBucket: envServer.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: envServer.FIREBASE_MESSAGING_SENDER_ID,
    appId: envServer.FIREBASE_APP_ID,
  });

  return `
importScripts('https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-messaging-compat.js');

firebase.initializeApp(${config});

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) { event.waitUntil(clients.claim()); });

const messaging = firebase.messaging();

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
`.trimStart();
}

export const Route = createFileRoute('/firebase-messaging-sw')({
  server: {
    handlers: {
      GET: () =>
        new Response(buildSwScript(), {
          headers: {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Service-Worker-Allowed': '/',
            'Cache-Control': 'no-cache',
          },
        }),
    },
  },
});
