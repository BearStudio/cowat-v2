import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import type { Messaging } from 'firebase-admin/messaging';
import { getMessaging } from 'firebase-admin/messaging';

import { envServer } from '@/env/server';
import { logger } from '@/server/logger';

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
