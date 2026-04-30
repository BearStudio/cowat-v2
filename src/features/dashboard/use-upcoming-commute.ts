import dayjs from 'dayjs';

import { CommuteEnriched } from '@/features/commute/schema';

export const useUpcomingCommute = (commutes: CommuteEnriched[] | undefined) => {
  const now = dayjs();
  return commutes?.find((commute) => {
    const firstStop = [...commute.stops].sort((a, b) => a.order - b.order)[0];
    if (!firstStop?.outwardTime) return false;
    const parts = firstStop.outwardTime.split(':');
    const hours = parseInt(parts[0] ?? '0', 10);
    const minutes = parseInt(parts[1] ?? '0', 10);
    const departureTime = dayjs(commute.date)
      .hour(hours)
      .minute(minutes)
      .second(0);
    const minutesUntilStart = departureTime.diff(now, 'minute');
    return minutesUntilStart >= -60 && minutesUntilStart <= 120;
  });
};
