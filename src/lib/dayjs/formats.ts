import {
  createFormatPlugin,
  type FormatConfig,
  type FormatKey,
} from './plugins/format';

// ─── Format constants ────────────────────────────────────────────────

const ISO_DATE = 'YYYY-MM-DD';
const SHORT_DATE = 'DD/MM/YYYY';
const DAY_NAME_SHORT_DATE = 'dddd D MMM';
const SHORT_DATE_WITH_TIME = 'DD/MM/YYYY [at] HH:mm';

// ─── Feature-scoped date format definitions ──────────────────────────

const dateFormats = {
  common: {
    iso: ISO_DATE,
    short: SHORT_DATE,
  },
  dashboard: {
    dayHeader: DAY_NAME_SHORT_DATE,
  },
  commute: {
    dayHeader: DAY_NAME_SHORT_DATE,
  },
  booking: {
    requestDate: SHORT_DATE,
    requestDateFull: 'dddd D MMM[.] YYYY',
  },
  user: {
    onboardedAt: SHORT_DATE_WITH_TIME,
  },
  buildInfo: {
    fallbackDisplay: ISO_DATE,
  },
  notification: 'dddd D MMMM',
} as const satisfies FormatConfig;

// ─── Types ───────────────────────────────────────────────────────────

export type DateFormats = typeof dateFormats;

/** Union of all valid "namespace:key" strings, e.g. 'common:short' | 'dashboard:dayHeader' | ... */
export type DateFormatKey = FormatKey<DateFormats>;

// ─── Plugin instance & helpers ───────────────────────────────────────

export const { plugin: formatPlugin, getDateFormat } =
  createFormatPlugin(dateFormats);

// ─── Type augmentation ───────────────────────────────────────────────

declare module 'dayjs' {
  interface Dayjs {
    /** Format a date using a feature-scoped format key (e.g. `'common:short'`). */
    f(key: DateFormatKey): string;
  }
}
