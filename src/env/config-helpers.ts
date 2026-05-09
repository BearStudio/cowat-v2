/* eslint-disable no-process-env */
import { Config, ConfigError, Effect, Either, Option } from 'effect';

import { LOG_LEVELS, LogLevel } from '@/server/log-level';

export const isProd = process.env.NODE_ENV === 'production';

export const isDev =
  typeof process !== 'undefined' && process.env.NODE_ENV
    ? process.env.NODE_ENV === 'development'
    : (import.meta.env?.DEV as boolean | undefined) === true;

// ─── Generic ──────────────────────────────────────────────────────────────────

export const urlConfig = (name: string) =>
  Config.string(name).pipe(
    Config.validate({
      message: `${name} must be a valid URL`,
      validation: (s) => URL.canParse(s),
    })
  );

export const commaSeparated = (
  name: string
): Config.Config<string[] | undefined> =>
  Config.option(Config.string(name)).pipe(
    Config.map((opt) =>
      Option.match(opt, {
        onNone: () => undefined,
        onSome: (s) => s.split(',').map((v) => v.trim()),
      })
    )
  );

// ─── Prod-aware ───────────────────────────────────────────────────────────────

export const requiredInProd = (
  name: string
): Config.Config<string | undefined> =>
  isProd
    ? (Config.string(name) as Config.Config<string | undefined>)
    : Config.option(Config.string(name)).pipe(
        Config.map(Option.getOrUndefined)
      );

export const optionalWithReplaceMe = (
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

export const logLevelConfig: Config.Config<LogLevel> = Config.string(
  'LOGGER_LEVEL'
).pipe(
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

export const emailServerConfig: Config.Config<string | undefined> = isProd
  ? Config.option(urlConfig('EMAIL_SERVER')).pipe(
      Config.map(Option.getOrUndefined)
    )
  : (urlConfig('EMAIL_SERVER') as Config.Config<string | undefined>);

// ─── Dev-aware ────────────────────────────────────────────────────────────────

export const optionalWithDevDefault = (
  name: string,
  devDefault: string
): Config.Config<string | undefined> =>
  Config.option(Config.string(name)).pipe(
    Config.map((opt) =>
      Option.match(opt, {
        onNone: () => (isDev ? devDefault : undefined),
        onSome: (v) => v,
      })
    )
  );

export const withEnvDefault = (
  name: string,
  devDefault: string,
  prodDefault: string
): Config.Config<string> =>
  Config.option(Config.string(name)).pipe(
    Config.map((opt) =>
      Option.getOrElse(opt, () => (isDev ? devDefault : prodDefault))
    )
  );

export const vercelAwareBaseUrl = Effect.gen(function* () {
  const vercelEnv = yield* Config.option(Config.string('VITE_VERCEL_ENV')).pipe(
    Config.map(Option.getOrUndefined)
  );
  const vercelBranchUrl = yield* Config.option(
    Config.string('VITE_VERCEL_BRANCH_URL')
  ).pipe(Config.map(Option.getOrUndefined));

  if (vercelEnv === 'preview' && vercelBranchUrl) {
    return `https://${vercelBranchUrl}`;
  }

  return yield* urlConfig('VITE_BASE_URL');
});
