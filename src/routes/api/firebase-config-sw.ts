import { createFileRoute } from '@tanstack/react-router';

import { envServer } from '@/env/server';

export const Route = createFileRoute('/api/firebase-config-sw')({
  server: {
    handlers: {
      // Returns the Firebase client config as a JS script so that the
      // service worker can load it synchronously via importScripts().
      GET: () => {
        const config = JSON.stringify({
          apiKey: envServer.FIREBASE_API_KEY,
          authDomain: envServer.FIREBASE_AUTH_DOMAIN,
          projectId: envServer.FIREBASE_PROJECT_ID,
          storageBucket: envServer.FIREBASE_STORAGE_BUCKET,
          messagingSenderId: envServer.FIREBASE_MESSAGING_SENDER_ID,
          appId: envServer.FIREBASE_APP_ID,
        });

        return new Response(`self.firebaseConfig = ${config};`, {
          headers: {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Cache-Control': 'no-cache',
          },
        });
      },
    },
  },
});
