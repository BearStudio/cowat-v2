import dayjs from 'dayjs';

import { CommuteEnriched } from '@/features/commute/schema';

export const useUpcomingCommute = (commutes: CommuteEnriched[] | undefined) => {
  const now = dayjs();

  return commutes?.find((commute) => {
    const stops = [...commute.stops].sort((a, b) => a.order - b.order);
    if (stops.length === 0) return false;
    const firstStop = stops[0];
    const lastStop = stops[stops.length - 1];
    const buildTime = (time?: string | null) => {
      if (!time) return null;
      const [h = '0', m = '0'] = time.split(':');
      return dayjs(commute.date)
        .hour(parseInt(h, 10))
        .minute(parseInt(m, 10))
        .second(0);
    };

    // Outward
    const outwardStart = buildTime(firstStop?.outwardTime)?.subtract(1, 'hour');
    const outwardEnd = buildTime(lastStop?.outwardTime);
    const isOutwardActive =
      now.isAfter(outwardStart) && now.isBefore(outwardEnd);

    // Inward
    const returnStart = buildTime(lastStop?.inwardTime)?.subtract(1, 'hour');
    const returnEnd = buildTime(firstStop?.inwardTime);
    const isReturnActive = now.isAfter(returnStart) && now.isBefore(returnEnd);

    return isOutwardActive || isReturnActive;
  });
};
