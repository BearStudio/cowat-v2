import { createSign } from 'node:crypto';

import { envServer } from '@/env/server';
import { logger } from '@/server/logger';

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

export type FCMMessage = {
  token: string;
  notification: { title: string; body: string };
  webpush?: {
    notification?: { icon?: string };
    fcmOptions?: { link?: string };
  };
};

export type FCMSendResult = {
  success: boolean;
  messageId?: string;
  error?: { code: string; message: string; status?: string };
};

// ── Token cache ──────────────────────────────────────────────────────────────

let cachedToken: { value: string; expiresAt: number } | null = null;
let serviceAccount: ServiceAccount | null = null;

function getServiceAccount(): ServiceAccount | null {
  if (serviceAccount) return serviceAccount;
  if (!envServer.FIREBASE_SERVICE_ACCOUNT) return null;

  serviceAccount = JSON.parse(
    Buffer.from(envServer.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8')
  ) as ServiceAccount;
  return serviceAccount;
}

function createJwt(sa: ServiceAccount): string {
  const header = Buffer.from(
    JSON.stringify({ alg: 'RS256', typ: 'JWT' })
  ).toString('base64url');

  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  ).toString('base64url');

  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(sa.private_key, 'base64url');

  return `${header}.${payload}.${signature}`;
}

async function getAccessToken(): Promise<string | null> {
  const sa = getServiceAccount();
  if (!sa) return null;

  // Return cached token if still valid (5 min buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.value;
  }

  const jwt = createJwt(sa);
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!response.ok) {
    logger.error(
      { status: response.status },
      'Firebase: failed to get access token'
    );
    return null;
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  logger.info('Firebase: access token obtained');
  return cachedToken.value;
}

// ── Public API ───────────────────────────────────────────────────────────────

export function isFirebaseConfigured(): boolean {
  return (
    !!envServer.FIREBASE_SERVICE_ACCOUNT && !!envServer.FIREBASE_PROJECT_ID
  );
}

export async function sendFcmMessage(
  message: FCMMessage
): Promise<FCMSendResult> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return {
      success: false,
      error: { code: 'auth/no-token', message: 'Failed to get access token' },
    };
  }

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${envServer.FIREBASE_PROJECT_ID}/messages:send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    }
  );

  if (response.ok) {
    const data = (await response.json()) as { name: string };
    return { success: true, messageId: data.name };
  }

  const errorData = (await response.json().catch(() => ({}))) as {
    error?: { code?: number; message?: string; status?: string };
  };

  return {
    success: false,
    error: {
      code: `messaging/${response.status}`,
      message: errorData.error?.message || response.statusText,
      status: errorData.error?.status,
    },
  };
}
