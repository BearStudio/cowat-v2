/* eslint-disable no-process-env */
import { ConfigProvider } from 'effect';

const env: Record<string, unknown> = import.meta.env ?? process.env;

export const ViteConfigProvider = ConfigProvider.fromMap(
  new Map(Object.entries(env as Record<string, string>).filter(([, v]) => v))
);

export const SKIP_ENV_VALIDATION = !!(env as Record<string, string>)
  .SKIP_ENV_VALIDATION;
