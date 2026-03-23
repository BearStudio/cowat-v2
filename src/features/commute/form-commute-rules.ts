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

  return {
    isRound,

    shouldInwardBeAfterOutward: (
      stop: Pick<FormFieldsStopInput, 'outwardTime' | 'inwardTime'>
    ) =>
      !isRound ||
      !stop.inwardTime ||
      !stop.outwardTime ||
      stop.inwardTime > stop.outwardTime,

    shouldOutwardBeIncreasing: (
      stop: Pick<FormFieldsStopInput, 'outwardTime'>,
      index: number
    ) => {
      if (index === 0) return true;
      const prevStop = data.stops[index - 1];
      return (
        !stop.outwardTime ||
        !prevStop?.outwardTime ||
        stop.outwardTime > prevStop.outwardTime
      );
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
  const isToday = dayjs(data.date).isToday();
  const isInPast = dayjs(data.date).isBefore(dayjs(), 'day');
  const stopOrderRules = createStopOrderRules(data);

  return {
    isToday,
    ...stopOrderRules,

    isOutwardInFuture: (stop: FormFieldsStopInput) =>
      !isInPast &&
      (!isToday ||
        !stop.outwardTime ||
        isTimeInFuture(data.date, stop.outwardTime)),

    isInwardInFuture: (stop: FormFieldsStopInput) =>
      !isInPast &&
      (!isToday ||
        !stopOrderRules.isRound ||
        !stop.inwardTime ||
        isTimeInFuture(data.date, stop.inwardTime)),
  };
};
