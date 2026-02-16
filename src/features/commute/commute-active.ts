import dayjs from 'dayjs';

import { CommuteEnriched } from '@/features/commute/schema';

const ACTIVE_THRESHOLD_HOURS = 3;
export const DEVTOOLS_FORCE_ACTIVE_COMMUTE_KEY =
  'devtools:force-active-commute';

export function isCommuteActive(commute: CommuteEnriched): boolean {
  if (typeof window !== 'undefined') {
    try {
      if (localStorage.getItem(DEVTOOLS_FORCE_ACTIVE_COMMUTE_KEY) === 'true') {
        return true;
      }
    } catch {
      // localStorage unavailable
    }
  }

  const earliestTime = commute.stops.map((s) => s.outwardTime).sort()[0];

  if (!earliestTime) return false;

  const [hours = 0, minutes = 0] = earliestTime.split(':').map(Number);
  const departureAt = dayjs(commute.date).hour(hours).minute(minutes);
  const now = dayjs();
  const endOfCommuteDay = dayjs(commute.date).endOf('day');

  return (
    now.isBefore(endOfCommuteDay) &&
    departureAt.diff(now, 'hour', true) <= ACTIVE_THRESHOLD_HOURS
  );
}
