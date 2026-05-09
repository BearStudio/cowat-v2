/* eslint-disable no-process-env */
import { Config, ConfigProvider, Effect, Layer, Option } from 'effect';

import { urlConfig } from './config-helpers';

const envMetaOrProcess: Record<string, unknown> =
  import.meta.env ?? process.env;

const isDev =
  typeof process !== 'undefined' && process.env.NODE_ENV
    ? process.env.NODE_ENV === 'development'
    : (import.meta.env?.DEV as boolean | undefined) === true;

// ─── Provider (Vite's import.meta.env — ConfigProvider.fromEnv() reads process.env only) ─

const provider = ConfigProvider.fromMap(
  new Map(
    Object.entries(envMetaOrProcess as Record<string, string>).filter(
      ([, v]) => v
    )
  )
);

// ─── Config ──────────────────────────────────────────────────────────────────

const clientConfig = Effect.gen(function* () {
  const vercelEnv = yield* Config.option(Config.string('VITE_VERCEL_ENV')).pipe(
    Config.map(Option.getOrUndefined)
  );
  const vercelBranchUrl = yield* Config.option(
    Config.string('VITE_VERCEL_BRANCH_URL')
  ).pipe(Config.map(Option.getOrUndefined));

  const baseUrl =
    vercelEnv === 'preview' && vercelBranchUrl
      ? `https://${vercelBranchUrl}`
      : yield* urlConfig('VITE_BASE_URL');

  return {
    VITE_BASE_URL: baseUrl,
    VITE_ENV_NAME: yield* Config.option(Config.string('VITE_ENV_NAME')).pipe(
      Config.map((opt) =>
        Option.match(opt, {
          onNone: () => (isDev ? 'LOCAL' : undefined),
          onSome: (v) => v,
        })
      )
    ),
    VITE_ENV_EMOJI: yield* Config.option(Config.string('VITE_ENV_EMOJI')).pipe(
      Config.map((opt): string | undefined =>
        Option.isSome(opt) ? opt.value : isDev ? '🚧' : undefined
      )
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
