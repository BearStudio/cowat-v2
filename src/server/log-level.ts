import type { Level } from 'pino';

export const LOG_LEVELS = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
] as const satisfies ReadonlyArray<Level>;

export type LogLevel = (typeof LOG_LEVELS)[number];
