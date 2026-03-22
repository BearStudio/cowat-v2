import { z } from 'zod';

import { envClient } from '@/env/client';
import { envServer } from '@/env/server';
import { publicProcedure } from '@/server/orpc';

const tags = ['config'];

export default {
  env: publicProcedure()
    .route({ method: 'GET', path: '/config/env', tags })
    .output(
      z.object({
        name: z.string().optional(),
        color: z.string(),
        emoji: z.string().optional(),
        isDev: z.boolean(),
      })
    )
    .handler(() => {
      return {
        name: envClient.VITE_ENV_NAME,
        color: envClient.VITE_ENV_COLOR,
        emoji: envClient.VITE_ENV_EMOJI,
        isDev: import.meta.env.DEV,
      };
    }),

  firebaseConfig: publicProcedure()
    .route({
      method: 'GET',
      path: '/config/firebase',
      tags,
      summary: 'Get Firebase client config',
      description:
        'Returns the Firebase client configuration. This is intentionally public — it is embedded in every web app JS bundle and is safe to expose. The real secrets (FIREBASE_SERVICE_ACCOUNT) are server-only and never sent here.',
    })
    .output(
      z.object({
        apiKey: z.string(),
        authDomain: z.string(),
        projectId: z.string(),
        storageBucket: z.string(),
        messagingSenderId: z.string(),
        appId: z.string(),
        vapidPublicKey: z.string(),
      })
    )
    .handler(() => {
      return {
        apiKey: envServer.FIREBASE_API_KEY,
        authDomain: envServer.FIREBASE_AUTH_DOMAIN,
        projectId: envServer.FIREBASE_PROJECT_ID,
        storageBucket: envServer.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: envServer.FIREBASE_MESSAGING_SENDER_ID,
        appId: envServer.FIREBASE_APP_ID,
        vapidPublicKey: envServer.FIREBASE_VAPID_PUBLIC_KEY,
      };
    }),
};
