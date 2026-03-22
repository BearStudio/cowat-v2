import type { Messaging } from 'firebase-admin/messaging';
import { createRequire } from 'node:module';

import { envServer } from '@/env/server';
import { logger } from '@/server/logger';

// createRequire loads firebase-admin as CJS at runtime, bypassing Rollup/Nitro
// bundling entirely. Bundling firebase-admin as ESM breaks SDK_VERSION init.
const _require = createRequire(import.meta.url);

let messagingInstance: Messaging | null = null;

export function getFirebaseMessaging(): Messaging | null {
  if (messagingInstance) return messagingInstance;

  logger.info(
    {
      hasServiceAccount: !!envServer.FIREBASE_SERVICE_ACCOUNT,
      projectId: envServer.FIREBASE_PROJECT_ID,
    },
    'Firebase: initializing firebase-admin'
  );

  const { applicationDefault, cert, getApps, initializeApp } = _require(
    'firebase-admin/app'
  ) as typeof import('firebase-admin/app');
  const { getMessaging } = _require(
    'firebase-admin/messaging'
  ) as typeof import('firebase-admin/messaging');

  logger.info('Firebase: require() succeeded');

  const credential = envServer.FIREBASE_SERVICE_ACCOUNT
    ? cert(
        JSON.parse(
          Buffer.from(envServer.FIREBASE_SERVICE_ACCOUNT, 'base64').toString(
            'utf-8'
          )
        )
      )
    : applicationDefault();

  const app =
    getApps()[0] ??
    initializeApp({
      credential,
      projectId: envServer.FIREBASE_PROJECT_ID,
    });

  messagingInstance = getMessaging(app);
  logger.info('Firebase: messaging instance created successfully');
  return messagingInstance;
}
