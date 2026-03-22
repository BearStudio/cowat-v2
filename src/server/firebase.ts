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

const auth = new GoogleAuth({
  credentials: JSON.parse(
    Buffer.from(envServer.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8')
  ),
  scopes: [FCM_AUTH_SCOPE],
});

export async function getAccessToken(): Promise<
  Result<string, FcmErrorResponse>
> {
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
  const response = await fetch(FCM_SEND_URL(envServer.FIREBASE_PROJECT_ID), {
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

/**
 * Whether the server has the required configuration to send push notifications.
 */
export function isConfigured(): boolean {
  return (
    !!envServer.FIREBASE_SERVICE_ACCOUNT && !!envServer.FIREBASE_PROJECT_ID
  );
}
