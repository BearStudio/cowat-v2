import dayjs from 'dayjs';

import type {
  FormFieldsCommute,
  FormFieldsStopInput,
} from '@/features/commute/schema';

const isTimeInFuture = (date: Date, time: string) => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return dayjs(date).hour(hours).minute(minutes).isAfter(dayjs());
};

type StopOrderRulesData = {
  type: string;
  stops: Array<Pick<FormFieldsStopInput, 'outwardTime' | 'inwardTime'>>;
};

export const createStopOrderRules = (data: StopOrderRulesData) => {
  const isRound = data.type === 'ROUND';
  const timeToMinutes = (time: string): number => {
    const [hours = 0, minutes = 0] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  return {
    isRound,

    shouldInwardBeAfterOutward: (
      stop: Pick<FormFieldsStopInput, 'outwardTime' | 'inwardTime'>
    ) => {
      if (!isRound || !stop.inwardTime || !stop.outwardTime) return true;

      const inward = timeToMinutes(stop.inwardTime);
      const outward = timeToMinutes(stop.outwardTime);

      if (inward >= outward) return true;

      return outward - inward > 12 * 60;
    },

    shouldOutwardBeIncreasing: (
      stop: Pick<FormFieldsStopInput, 'outwardTime'>,
      index: number
    ) => {
      if (index === 0) return true;
      const prevStop = data.stops[index - 1];
      if (!stop.outwardTime || !prevStop?.outwardTime) return true;

      const curr = timeToMinutes(stop.outwardTime);
      const prev = timeToMinutes(prevStop.outwardTime);

      if (curr > prev) return true;

      const forwardDistance = curr + 24 * 60 - prev;
      return forwardDistance > 0 && forwardDistance < 12 * 60;
    },

    shouldInwardBeDecreasing: (
      stop: Pick<FormFieldsStopInput, 'inwardTime'>,
      index: number
    ) => {
      if (index === 0 || !isRound) return true;
      const prevStop = data.stops[index - 1];
      return (
        !stop.inwardTime ||
        !prevStop?.inwardTime ||
        stop.inwardTime < prevStop.inwardTime
      );
    },
  };
};

export const createCommuteRules = (data: FormFieldsCommute) => {
  const now = dayjs();
  const date = dayjs(data.date);

  const isToday = date.isToday();
  const isInPast = date.isBefore(now, 'day');

  const stopOrderRules = createStopOrderRules(data);

  const isFutureTime = (time?: string) =>
    !time || isTimeInFuture(data.date, time);

  return {
    isToday,
    ...stopOrderRules,

    isOutwardInFuture: (stop: FormFieldsStopInput) => {
      if (isInPast) return false;
      if (!isToday) return true;
      return isFutureTime(stop.outwardTime);
    },

    isInwardInFuture: (stop: FormFieldsStopInput) => {
      if (isInPast) return false;
      if (!isToday) return true;
      if (!stopOrderRules.isRound) return true;
      return isFutureTime(stop.inwardTime || undefined);
    },
  };
};
