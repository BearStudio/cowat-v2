/** Returns today's date at midnight (00:00:00.000). */
export function getToday(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}
