import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import { envClient } from '@/env/client';
import { getClientConfig } from '@/server/firebase';
import { protectedProcedure, publicProcedure } from '@/server/orpc';

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

  firebaseConfig: protectedProcedure({ permission: null })
    .route({
      method: 'GET',
      path: '/config/firebase',
      tags,
      summary: 'Get Firebase client config',
      description:
        'Returns the Firebase client configuration. Only authenticated users need this — push notification registration requires a session.',
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
      const config = getClientConfig();
      if (!config) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Firebase is not configured',
        });
      }

      return config;
    }),
};
