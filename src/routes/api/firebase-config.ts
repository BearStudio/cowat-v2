import { createFileRoute } from '@tanstack/react-router';

import { envServer } from '@/env/server';

export const Route = createFileRoute('/api/firebase-config')({
  server: {
    handlers: {
      // Firebase client config is intentionally public — it is embedded in
      // every web app's JS bundle and is safe to expose. The real secrets
      // (FIREBASE_SERVICE_ACCOUNT) are server-only and never sent here.
      GET: () => {
        return Response.json({
          apiKey: envServer.FIREBASE_API_KEY,
          authDomain: envServer.FIREBASE_AUTH_DOMAIN,
          projectId: envServer.FIREBASE_PROJECT_ID,
          storageBucket: envServer.FIREBASE_STORAGE_BUCKET,
          messagingSenderId: envServer.FIREBASE_MESSAGING_SENDER_ID,
          appId: envServer.FIREBASE_APP_ID,
          vapidPublicKey: envServer.FIREBASE_VAPID_PUBLIC_KEY,
        });
      },
    },
  },
});
