/* eslint-disable no-process-env */
import { Config, Effect, Option } from 'effect';

import {
  commaSeparated,
  emailServerConfig,
  isProd,
  logLevelConfig,
  optionalWithReplaceMe,
  requiredInProd,
} from './config-helpers';

const serverConfig = Effect.gen(function* () {
  return {
    DATABASE_URL: yield* Config.url('DATABASE_URL').pipe(
      Config.map((u) => u.href)
    ),
    AUTH_SECRET: yield* Config.string('AUTH_SECRET'),
    AUTH_SESSION_EXPIRATION_IN_SECONDS: yield* Config.integer(
      'AUTH_SESSION_EXPIRATION_IN_SECONDS'
    ).pipe(Config.withDefault(2592000)),
    AUTH_SESSION_UPDATE_AGE_IN_SECONDS: yield* Config.integer(
      'AUTH_SESSION_UPDATE_AGE_IN_SECONDS'
    ).pipe(Config.withDefault(86400)),
    AUTH_TRUSTED_ORIGINS: yield* commaSeparated('AUTH_TRUSTED_ORIGINS'),
    AUTH_ALLOWED_HOSTS: yield* commaSeparated('AUTH_ALLOWED_HOSTS'),
    VERCEL_URL: yield* Config.option(Config.string('VERCEL_URL')).pipe(
      Config.map(Option.getOrUndefined)
    ),
    VERCEL_BRANCH_URL: yield* Config.option(
      Config.string('VERCEL_BRANCH_URL')
    ).pipe(Config.map(Option.getOrUndefined)),
    EMAIL_SERVER: yield* emailServerConfig,
    EMAIL_FROM: yield* Config.string('EMAIL_FROM'),
    RESEND_API_KEY: yield* optionalWithReplaceMe('RESEND_API_KEY'),
    LOGGER_LEVEL: yield* logLevelConfig,
    LOGGER_PRETTY: yield* Config.boolean('LOGGER_PRETTY').pipe(
      Config.withDefault(!isProd)
    ),
    S3_ACCESS_KEY_ID: yield* Config.string('S3_ACCESS_KEY_ID'),
    S3_SECRET_ACCESS_KEY: yield* Config.string('S3_SECRET_ACCESS_KEY'),
    S3_BUCKET_NAME: yield* Config.string('S3_BUCKET_NAME').pipe(
      Config.withDefault('default')
    ),
    S3_REGION: yield* Config.string('S3_REGION').pipe(
      Config.withDefault('auto')
    ),
    S3_HOST: yield* Config.string('S3_HOST'),
    S3_SECURE: yield* Config.boolean('S3_SECURE').pipe(
      Config.withDefault(true)
    ),
    S3_FORCE_PATH_STYLE: yield* Config.boolean('S3_FORCE_PATH_STYLE').pipe(
      Config.withDefault(false)
    ),
    FIREBASE_API_KEY: yield* requiredInProd('FIREBASE_API_KEY'),
    FIREBASE_AUTH_DOMAIN: yield* requiredInProd('FIREBASE_AUTH_DOMAIN'),
    FIREBASE_PROJECT_ID: yield* requiredInProd('FIREBASE_PROJECT_ID'),
    FIREBASE_STORAGE_BUCKET: yield* requiredInProd('FIREBASE_STORAGE_BUCKET'),
    FIREBASE_MESSAGING_SENDER_ID: yield* requiredInProd(
      'FIREBASE_MESSAGING_SENDER_ID'
    ),
    FIREBASE_APP_ID: yield* requiredInProd('FIREBASE_APP_ID'),
    FIREBASE_VAPID_PUBLIC_KEY: yield* requiredInProd(
      'FIREBASE_VAPID_PUBLIC_KEY'
    ),
    FIREBASE_SERVICE_ACCOUNT: yield* requiredInProd('FIREBASE_SERVICE_ACCOUNT'),
    CRON_SECRET: yield* requiredInProd('CRON_SECRET'),
  };
});

const loadConfig = () => Effect.runSync(serverConfig);

export const envServer = process.env.SKIP_ENV_VALIDATION
  ? ({} as ReturnType<typeof loadConfig>)
  : loadConfig();

export class ServerConfig extends Effect.Service<ServerConfig>()(
  'ServerConfig',
  {
    succeed: envServer,
  }
) {}
