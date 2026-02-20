import type { PluginFunc } from 'dayjs';

// ─── Types ───────────────────────────────────────────────────────────

/** Shape of a date-format configuration object: namespaced string → string mappings. */
export type FormatConfig = {
  readonly [ns: string]: { readonly [key: string]: string };
};

/** Derives the union of `"namespace:key"` strings from a config object. */
export type FormatKey<T extends FormatConfig> = {
  [NS in Extract<keyof T, string>]: `${NS}:${Extract<keyof T[NS], string>}`;
}[Extract<keyof T, string>];

// ─── Factory ─────────────────────────────────────────────────────────

/**
 * Creates a dayjs plugin that adds a `.f(key)` instance method for
 * feature-scoped date formatting.
 *
 * @example
 * const { plugin, getDateFormat } = createFormatPlugin({
 *   common: { iso: 'YYYY-MM-DD', short: 'DD/MM/YYYY' },
 * } as const);
 *
 * dayjs.extend(plugin);
 * dayjs().f('common:short'); // => '20/02/2026'
 */
export function createFormatPlugin<const T extends FormatConfig>(config: T) {
  function getDateFormat(key: FormatKey<T>): string {
    const [ns, name] = key.split(':') as [string, string];
    return (config as FormatConfig)[ns]![name]!;
  }

  const plugin: PluginFunc = (_option, dayjsClass) => {
    // Type safety for callers is enforced by the consumer's `declare module 'dayjs'` augmentation.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dayjsClass.prototype.f = function (key: any) {
      return this.format(getDateFormat(key));
    };
  };

  return { plugin, getDateFormat };
}
