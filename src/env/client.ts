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

const envMetaOrProcess: Record<string, unknown> =
  import.meta.env ?? process.env;

const isDev =
  typeof process !== 'undefined' && process.env.NODE_ENV
    ? process.env.NODE_ENV === 'development'
    : (import.meta.env?.DEV as boolean | undefined) === true;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const urlConfig = (name: string) =>
  Config.string(name).pipe(
    Config.validate({
      message: `${name} must be a valid URL`,
      validation: (s) => URL.canParse(s),
    })
  );

const emojiConfig = (name: string): Config.Config<string | undefined> =>
  Config.option(Config.string(name)).pipe(
    Config.mapOrFail((opt) => {
      const value = Option.getOrUndefined(opt);
      if (value !== undefined && !/\p{Extended_Pictographic}/u.test(value)) {
        return Either.left(
          ConfigError.InvalidData([name], `${name} must be an emoji`)
        );
      }
      return Either.right(value);
    })
  );

// ─── Provider (Vite import.meta.env, strips empty strings) ───────────────────

const provider = ConfigProvider.fromMap(
  new Map(
    Object.entries(envMetaOrProcess).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === 'string' && entry[1] !== ''
    )
  )
);

// ─── Base URL (Vercel preview detection) ─────────────────────────────────────

const baseUrlConfig = Effect.gen(function* () {
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

// ─── Config ──────────────────────────────────────────────────────────────────

const clientConfig = Effect.gen(function* () {
  return {
    VITE_BASE_URL: yield* baseUrlConfig,
    VITE_ENV_NAME: yield* Config.option(Config.string('VITE_ENV_NAME')).pipe(
      Config.map((opt) =>
        Option.match(opt, {
          onNone: () => (isDev ? 'LOCAL' : undefined),
          onSome: (v) => v,
        })
      )
    ),
    VITE_ENV_EMOJI: yield* emojiConfig('VITE_ENV_EMOJI').pipe(
      Config.map((value) => value ?? (isDev ? '🚧' : undefined))
    ),
    VITE_ENV_COLOR: yield* Config.option(Config.string('VITE_ENV_COLOR')).pipe(
      Config.map((opt) =>
        Option.getOrElse(opt, () => (isDev ? 'gold' : 'plum'))
      )
    ),
    VITE_S3_BUCKET_PUBLIC_URL: yield* urlConfig('VITE_S3_BUCKET_PUBLIC_URL'),
  };
});

// ─── Export ──────────────────────────────────────────────────────────────────

const loadConfig = () =>
  Effect.runSync(
    clientConfig.pipe(Effect.provide(Layer.setConfigProvider(provider)))
  );

export const envClient = (envMetaOrProcess as Record<string, string>)
  .SKIP_ENV_VALIDATION
  ? ({} as ReturnType<typeof loadConfig>)
  : loadConfig();

export class ClientConfig extends Effect.Service<ClientConfig>()(
  'ClientConfig',
  {
    succeed: envClient,
  }
) {}
