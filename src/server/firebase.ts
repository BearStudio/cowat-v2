import { Result } from 'better-result';
import { GoogleAuth } from 'google-auth-library';

import { envServer } from '@/env/server';
import { logger } from '@/server/logger';

// ── Types ────────────────────────────────────────────────────────────────────

type FcmNotification = {
  title: string;
  body: string;
};

type FcmWebPushConfig = {
  notification?: { icon?: string };
  fcmOptions?: { link?: string };
};

export type FcmMessage = {
  token: string;
  notification: FcmNotification;
  webpush?: FcmWebPushConfig;
};

export type FcmSuccessResponse = {
  messageId: string;
};

export type FcmErrorResponse = {
  code: string;
  message: string;
  status?: string;
};

// ── Constants ────────────────────────────────────────────────────────────────

const FCM_AUTH_SCOPE =
  'https://www.googleapis.com/auth/firebase.messaging' as const;

const FCM_SEND_URL = (projectId: string) =>
  `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send` as const;

// ── Auth ─────────────────────────────────────────────────────────────────────

let _auth: GoogleAuth | null = null;

function getAuth(): GoogleAuth | null {
  if (_auth) return _auth;
  const config = getServerConfig();
  if (!config) return null;
  _auth = new GoogleAuth({
    credentials: JSON.parse(
      Buffer.from(config.serviceAccount, 'base64').toString('utf-8')
    ),
    scopes: [FCM_AUTH_SCOPE],
  });
  return _auth;
}

export async function getAccessToken(): Promise<
  Result<string, FcmErrorResponse>
> {
  const auth = getAuth();
  if (!auth) {
    return Result.err({
      code: 'auth/not-configured',
      message: 'Firebase is not configured',
    });
  }

  const tokenResult = await Result.tryPromise(async () => {
    const client = await auth.getClient();
    const { token } = await client.getAccessToken();
    return token;
  });

  if (tokenResult.isErr()) {
    logger.error({ err: tokenResult.error }, 'FCM: failed to get access token');
    return Result.err({
      code: 'auth/failed',
      message:
        tokenResult.error instanceof Error
          ? tokenResult.error.message
          : 'Failed to get access token',
    });
  }

  if (!tokenResult.value) {
    return Result.err({
      code: 'auth/empty-token',
      message: 'Access token was empty',
    });
  }

  return Result.ok(tokenResult.value);
}

// ── Send ─────────────────────────────────────────────────────────────────────

export async function postMessage(
  accessToken: string,
  message: FcmMessage
): Promise<Result<FcmSuccessResponse, FcmErrorResponse>> {
  const config = getServerConfig();
  if (!config) {
    return Result.err({
      code: 'messaging/not-configured',
      message: 'Firebase is not configured',
    });
  }

  const response = await fetch(FCM_SEND_URL(config.projectId), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (response.ok) {
    const data = (await response.json()) as { name: string };
    return Result.ok({ messageId: data.name });
  }

  const body = (await response.json().catch(() => ({}))) as {
    error?: { code?: number; message?: string; status?: string };
  };

  return Result.err({
    code: `messaging/${response.status}`,
    message: body.error?.message ?? response.statusText,
    status: body.error?.status,
  });
}

// ── Config ───────────────────────────────────────────────────────────────────

export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  vapidPublicKey: string;
};

type FirebaseServerConfig = FirebaseClientConfig & {
  serviceAccount: string;
};

export function getClientConfig(): FirebaseClientConfig | null {
  const {
    FIREBASE_API_KEY: apiKey,
    FIREBASE_AUTH_DOMAIN: authDomain,
    FIREBASE_PROJECT_ID: projectId,
    FIREBASE_STORAGE_BUCKET: storageBucket,
    FIREBASE_MESSAGING_SENDER_ID: messagingSenderId,
    FIREBASE_APP_ID: appId,
    FIREBASE_VAPID_PUBLIC_KEY: vapidPublicKey,
  } = envServer;

  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !storageBucket ||
    !messagingSenderId ||
    !appId ||
    !vapidPublicKey
  ) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    vapidPublicKey,
  };
}

function getServerConfig(): FirebaseServerConfig | null {
  const clientConfig = getClientConfig();
  const serviceAccount = envServer.FIREBASE_SERVICE_ACCOUNT;
  if (!clientConfig || !serviceAccount) return null;
  return { ...clientConfig, serviceAccount };
}

/**
 * Whether the server has the required configuration to send push notifications.
 */
export function isConfigured(): boolean {
  return getServerConfig() !== null;
}
