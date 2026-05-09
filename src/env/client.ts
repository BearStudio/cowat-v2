/* eslint-disable no-process-env */
import { Config, ConfigProvider, Effect, Layer } from 'effect';

import {
  optionalWithDevDefault,
  vercelAwareBaseUrl,
  withEnvDefault,
} from './helpers';

const envMetaOrProcess: Record<string, unknown> =
  import.meta.env ?? process.env;

const provider = ConfigProvider.fromMap(
  new Map(
    Object.entries(envMetaOrProcess as Record<string, string>).filter(
      ([, v]) => v
    )
  )
);

const clientConfig = Effect.gen(function* () {
  return {
    VITE_BASE_URL: yield* vercelAwareBaseUrl,
    VITE_ENV_NAME: yield* optionalWithDevDefault('VITE_ENV_NAME', 'LOCAL'),
    VITE_ENV_EMOJI: yield* optionalWithDevDefault('VITE_ENV_EMOJI', '🚧'),
    VITE_ENV_COLOR: yield* withEnvDefault('VITE_ENV_COLOR', 'gold', 'plum'),
    VITE_S3_BUCKET_PUBLIC_URL: yield* Config.url(
      'VITE_S3_BUCKET_PUBLIC_URL'
    ).pipe(Config.map((u) => u.href)),
  };
});

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
