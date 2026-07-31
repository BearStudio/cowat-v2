import dayjs from 'dayjs';

import { toNoonUTC } from './to-noon-utc';

/**
 * Serialize a date-only value for use in a URL search param (`YYYY-MM-DD`).
 *
 * Search param values must round-trip unchanged through `validateSearch`,
 * otherwise the router keeps redirecting to "normalize" them. Keeping the param
 * a plain string (instead of transforming it into a `Date`) guarantees that.
 */
export function toDateParam(date: Date): string {
  return toNoonUTC(date).toISOString().slice(0, 10);
}

/**
 * Parse a date search param back into a `Date` at noon UTC on the same
 * calendar day. Accepts `YYYY-MM-DD` as well as full ISO strings.
 */
export function fromDateParam(value: string): Date {
  return toNoonUTC(dayjs(value).toDate());
}
