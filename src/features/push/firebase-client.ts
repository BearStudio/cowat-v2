import { getApps, initializeApp } from 'firebase/app';
import type { Messaging } from 'firebase/messaging';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

import { orpcClient } from '@/lib/orpc/client';
import type { Outputs } from '@/lib/orpc/types';

type FirebaseClientConfig = Outputs['config']['firebaseConfig'];

let configCache: FirebaseClientConfig | null = null;
// Module-level promise prevents duplicate in-flight requests when multiple
// callers invoke getFirebaseConfig() concurrently before the first resolves.
let configPromise: Promise<FirebaseClientConfig> | null = null;

async function getFirebaseConfig(): Promise<FirebaseClientConfig> {
  if (configCache) return configCache;
  if (!configPromise) {
    configPromise = orpcClient.config.firebaseConfig({});
  }
  try {
    configCache = await configPromise;
    return configCache;
  } catch (err) {
    configPromise = null;
    throw err;
  }
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

let messagingInstance: Messaging | null = null;

export async function getClientMessaging(): Promise<Messaging | null> {
  if (!isPushSupported()) return null;
  if (messagingInstance) return messagingInstance;

  const config = await getFirebaseConfig();

  try {
    const app = getApps()[0] ?? initializeApp(config);
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch {
    return null;
  }
}

let swRegistrationPromise: Promise<ServiceWorkerRegistration> | null = null;

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  if (!swRegistrationPromise) {
    swRegistrationPromise = (async () => {
      await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
      });
      return navigator.serviceWorker.ready;
    })().catch((err) => {
      swRegistrationPromise = null;
      throw err;
    });
  }

  return swRegistrationPromise;
}

export async function getFcmToken(): Promise<string | null> {
  const config = await getFirebaseConfig();
  const messaging = await getClientMessaging();
  if (!messaging) return null;

  try {
    const activeRegistration = await getServiceWorkerRegistration();

    return await getToken(messaging, {
      vapidKey: config.vapidPublicKey,
      serviceWorkerRegistration: activeRegistration,
    });
  } catch (err) {
    console.debug('[FCM] Failed to get token:', err);
    return null;
  }
}

export { onMessage };
