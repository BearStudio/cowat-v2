import type { Messaging } from 'firebase-admin/messaging';

import { envServer } from '@/env/server';
import { logger } from '@/server/logger';

let messagingInstance: Messaging | null = null;

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (messagingInstance) return messagingInstance;

  logger.info(
    {
      hasServiceAccount: !!envServer.FIREBASE_SERVICE_ACCOUNT,
      projectId: envServer.FIREBASE_PROJECT_ID,
    },
    'Firebase: initializing firebase-admin'
  );

  // Dynamic imports so that Nitro does not bundle firebase-admin as ESM
  // (bundling breaks SDK_VERSION initialisation at module load time).
  const { applicationDefault, cert, getApps, initializeApp } =
    await import('firebase-admin/app');
  const { getMessaging } = await import('firebase-admin/messaging');

  logger.info('Firebase: dynamic imports succeeded');

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
