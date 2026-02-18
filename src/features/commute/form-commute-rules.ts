import dayjs from 'dayjs';

import type {
  FormFieldsCommute,
  FormFieldsStopInput,
} from '@/features/commute/schema';

const isTimeInFuture = (date: Date, time: string) => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return dayjs(date).hour(hours).minute(minutes).isAfter(dayjs());
};

export const createCommuteRules = (data: FormFieldsCommute) => {
  const isToday = dayjs(data.date).isToday();
  const isRound = data.type === 'ROUND';

  return {
    isToday,
    isRound,

    isOutwardInFuture: (stop: FormFieldsStopInput) =>
      !isToday ||
      !stop.outwardTime ||
      isTimeInFuture(data.date, stop.outwardTime),

    isInwardInFuture: (stop: FormFieldsStopInput) =>
      !isToday ||
      !isRound ||
      !stop.inwardTime ||
      isTimeInFuture(data.date, stop.inwardTime),

    shouldInwardBeAfterOutward: (stop: FormFieldsStopInput) =>
      !isRound ||
      !stop.inwardTime ||
      !stop.outwardTime ||
      stop.inwardTime > stop.outwardTime,

    shouldOutwardBeIncreasing: (stop: FormFieldsStopInput, index: number) => {
      if (index === 0) return true;
      const prevStop = data.stops[index - 1];
      return (
        !stop.outwardTime ||
        !prevStop?.outwardTime ||
        stop.outwardTime > prevStop.outwardTime
      );
    },

    shouldInwardBeDecreasing: (stop: FormFieldsStopInput, index: number) => {
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
