import dayjs, { type ConfigType } from 'dayjs';

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
  },
  user: {
    onboardedAt: SHORT_DATE_WITH_TIME,
  },
  buildInfo: {
    fallbackDisplay: ISO_DATE,
  },
} as const;

export default dateFormats;

// ─── Types ───────────────────────────────────────────────────────────

export type DateFormats = typeof dateFormats;

export type DateFormatNamespace = keyof DateFormats;

/** Union of all valid "namespace:key" strings, e.g. 'common:short' | 'dashboard:dayHeader' | ... */
export type DateFormatKey = {
  [NS in DateFormatNamespace]: `${NS}:${Extract<keyof DateFormats[NS], string>}`;
}[DateFormatNamespace];

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Returns the raw Day.js format string for a given date format key.
 *
 * Use this when you need the format string itself (not a formatted date),
 * for example as a `format` prop or placeholder in `DateInput`.
 *
 * @example
 * getDateFormat('common:short')  // => 'DD/MM/YYYY'
 */
export function getDateFormat(key: DateFormatKey): string {
  const [ns, name] = key.split(':') as [DateFormatNamespace, string];

  return (dateFormats as ExplicitAny)[ns][name] as string;
}

/**
 * Formats a date value using a feature-scoped date format key.
 *
 * @example
 * formatDate(new Date(), 'dashboard:dayHeader')    // => "lundi 12/05"
 * formatDate(user.onboardedAt, 'user:onboardedAt') // => "12/05/2025 at 14:30"
 */
export function formatDate(date: ConfigType, key: DateFormatKey): string {
  return dayjs(date).format(getDateFormat(key));
}
