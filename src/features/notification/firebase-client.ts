import { getApps, initializeApp } from 'firebase/app';
import type { Messaging } from 'firebase/messaging';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

type FirebaseClientConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  vapidPublicKey?: string;
};

let configCache: FirebaseClientConfig | null = null;

async function getFirebaseConfig(): Promise<FirebaseClientConfig> {
  if (configCache) return configCache;
  const res = await fetch('/api/firebase-config');
  configCache = await res.json();
  return configCache!;
}

function isConfigured(config: FirebaseClientConfig): boolean {
  return !!(
    config.apiKey &&
    config.projectId &&
    config.messagingSenderId &&
    config.appId
  );
}

function isPushSupported(): boolean {
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
  if (!isConfigured(config)) {
    console.debug(
      '[FCM] Firebase not configured (missing FIREBASE_* env vars)'
    );
    return null;
  }

  try {
    const app = getApps()[0] ?? initializeApp(config);
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch {
    return null;
  }
}

export async function getFcmToken(): Promise<string | null> {
  const config = await getFirebaseConfig();

  if (!config.vapidPublicKey) {
    console.debug('[FCM] Missing FIREBASE_VAPID_PUBLIC_KEY');
    return null;
  }

  const messaging = await getClientMessaging();
  if (!messaging) return null;

  try {
    const swRegistration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw',
      { scope: '/' }
    );
    await navigator.serviceWorker.ready;
    return await getToken(messaging, {
      vapidKey: config.vapidPublicKey,
      serviceWorkerRegistration: swRegistration,
    });
  } catch (err) {
    console.debug('[FCM] Failed to get token:', err);
    return null;
  }
}

export { onMessage };
