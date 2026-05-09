/* eslint-disable no-process-env */
import {
  Config,
  ConfigError,
  ConfigProvider,
  Effect,
  Either,
  Layer,
  Option,
} from 'effect';

const isProd = process.env.NODE_ENV === 'production';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const urlConfig = (name: string) =>
  Config.string(name).pipe(
    Config.validate({
      message: `${name} must be a valid URL`,
      validation: (s) => URL.canParse(s),
    })
  );

const requiredInProd = (name: string): Config.Config<string | undefined> =>
  isProd
    ? (Config.string(name) as Config.Config<string | undefined>)
    : Config.option(Config.string(name)).pipe(
        Config.map(Option.getOrUndefined)
      );

const optionalWithReplaceMe = (
  name: string
): Config.Config<string | undefined> =>
  Config.option(Config.string(name)).pipe(
    Config.mapOrFail((opt) => {
      const value = Option.getOrUndefined(opt);
      if (isProd && value === 'REPLACE ME') {
        return Either.left(
          ConfigError.InvalidData(
            [name],
            'Update the value "REPLACE ME" or remove the variable'
          )
        );
      }
      return Either.right(value === 'REPLACE ME' ? undefined : value);
    })
  );

const commaSeparated = (name: string): Config.Config<string[] | undefined> =>
  Config.option(Config.string(name)).pipe(
    Config.map((opt) =>
      Option.match(opt, {
        onNone: () => undefined,
        onSome: (s) => s.split(',').map((v) => v.trim()),
      })
    )
  );

const LOG_LEVELS = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

const logLevelConfig = Config.string('LOGGER_LEVEL').pipe(
  Config.withDefault(isProd ? 'error' : 'info'),
  Config.mapOrFail((s) =>
    (LOG_LEVELS as readonly string[]).includes(s)
      ? Either.right(s as LogLevel)
      : Either.left(
          ConfigError.InvalidData(
            ['LOGGER_LEVEL'],
            `Must be one of: ${LOG_LEVELS.join(', ')}`
          )
        )
  )
);

const emailServerConfig: Config.Config<string | undefined> = isProd
  ? Config.option(urlConfig('EMAIL_SERVER')).pipe(
      Config.map(Option.getOrUndefined)
    )
  : (urlConfig('EMAIL_SERVER') as Config.Config<string | undefined>);

// ─── Config ──────────────────────────────────────────────────────────────────

const serverConfig = Effect.gen(function* () {
  return {
    DATABASE_URL: yield* urlConfig('DATABASE_URL'),
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

// ─── Provider (strips empty strings, matching t3-env's emptyStringAsUndefined) ─

const provider = ConfigProvider.fromMap(
  new Map(
    Object.entries(process.env).filter(
      (entry): entry is [string, string] =>
        entry[1] !== undefined && entry[1] !== ''
    )
  )
);

// ─── Export ──────────────────────────────────────────────────────────────────

const loadConfig = () =>
  Effect.runSync(
    serverConfig.pipe(Effect.provide(Layer.setConfigProvider(provider)))
  );

export const envServer = process.env.SKIP_ENV_VALIDATION
  ? ({} as ReturnType<typeof loadConfig>)
  : loadConfig();

export class ServerConfig extends Effect.Service<ServerConfig>()(
  'ServerConfig',
  {
    succeed: envServer,
  }
) {}
