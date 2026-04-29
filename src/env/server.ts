/* eslint-disable no-process-env */
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const isProd = process.env.NODE_ENV
  ? process.env.NODE_ENV === 'production'
  : import.meta.env?.PROD;

export const envServer = createEnv({
  server: {
    DATABASE_URL: z.url(),
    AUTH_SECRET: z.string(),
    AUTH_SESSION_EXPIRATION_IN_SECONDS: z.coerce
      .number()
      .int()
      .prefault(2592000), // 30 days by default
    AUTH_SESSION_UPDATE_AGE_IN_SECONDS: z.coerce.number().int().prefault(86400), // 1 day by default
    AUTH_TRUSTED_ORIGINS: z
      .string()
      .optional()
      .transform((stringValue) => stringValue?.split(',').map((v) => v.trim())),
    AUTH_ALLOWED_HOSTS: z
      .string()
      .optional()
      .transform((stringValue) => stringValue?.split(',').map((v) => v.trim())),
    VERCEL_URL: z.string().optional(),
    VERCEL_BRANCH_URL: z.string().optional(),

    EMAIL_SERVER: isProd ? z.url().optional() : z.url(),
    EMAIL_FROM: z.string(),
    RESEND_API_KEY: zOptionalWithReplaceMe(),

    LOGGER_LEVEL: z
      .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
      .prefault(isProd ? 'error' : 'info'),
    LOGGER_PRETTY: z
      .enum(['true', 'false'])
      .prefault(isProd ? 'false' : 'true')
      .transform((value) => value === 'true'),
    FIREBASE_API_KEY: zRequiredInProd(),
    FIREBASE_AUTH_DOMAIN: zRequiredInProd(),
    FIREBASE_PROJECT_ID: zRequiredInProd(),
    FIREBASE_STORAGE_BUCKET: zRequiredInProd(),
    FIREBASE_MESSAGING_SENDER_ID: zRequiredInProd(),
    FIREBASE_APP_ID: zRequiredInProd(),
    FIREBASE_VAPID_PUBLIC_KEY: zRequiredInProd(),
    FIREBASE_SERVICE_ACCOUNT: zRequiredInProd(),

    CRON_SECRET: zRequiredInProd(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

function zRequiredInProd() {
  return isProd ? z.string() : z.string().optional();
}

function zOptionalWithReplaceMe() {
  return z
    .string()
    .optional()
    .refine(
      (value) =>
        // Check in prodution if the value is not REPLACE ME
        !isProd || value !== 'REPLACE ME',
      {
        error: 'Update the value "REPLACE ME" or remove the variable',
      }
    )
    .transform((value) => (value === 'REPLACE ME' ? undefined : value));
}
