import { Config, Effect } from 'effect';

import {
  optionalWithDevDefault,
  vercelAwareBaseUrl,
  withEnvDefault,
} from './helpers';
import { SKIP_ENV_VALIDATION, ViteConfigProvider } from './provider';

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
  Effect.runSync(Effect.withConfigProvider(clientConfig, ViteConfigProvider));

export const envClient = SKIP_ENV_VALIDATION
  ? ({} as ReturnType<typeof loadConfig>)
  : loadConfig();
