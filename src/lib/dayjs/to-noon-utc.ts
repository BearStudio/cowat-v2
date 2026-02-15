/**
 * Normalizes a Date to noon UTC on the same local calendar day.
 * This prevents timezone shifts when serializing date-only values to JSON.
 *
 * Example: A user in UTC+1 picks Feb 15 → midnight local = Feb 14 23:00 UTC.
 * This function returns Feb 15 12:00 UTC instead, preserving the correct date.
 */
export function toNoonUTC(date: Date): Date {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0)
  );
}
