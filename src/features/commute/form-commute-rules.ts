import dayjs from 'dayjs';

import type {
  FormFieldsCommute,
  FormFieldsStopInput,
} from '@/features/commute/schema';
import { computeDayOffsets } from '@/features/commute/time-utils';

const isTimeInFuture = (date: Date, time: string, dayOffset = 0) => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  const instant = dayjs(date).hour(hours).minute(minutes).add(dayOffset, 'day');
  return instant.isAfter(dayjs());
};

type StopOrderRulesData = {
  type: string;
  stops: Array<Pick<FormFieldsStopInput, 'outwardTime' | 'inwardTime'>>;
};

export const createStopOrderRules = (data: StopOrderRulesData) => {
  const isRound = data.type === 'ROUND';

  return {
    isRound,

    // A return time earlier than the outward time is read as the next day
    // (e.g. outward 15:00, inward 02:00), so any distinct time is valid.
    // Only an identical time is rejected (zero-length round trip).
    shouldInwardDifferFromOutward: (
      stop: Pick<FormFieldsStopInput, 'outwardTime' | 'inwardTime'>
    ) =>
      !isRound ||
      !stop.inwardTime ||
      !stop.outwardTime ||
      stop.inwardTime !== stop.outwardTime,

    // Across stops a later time means progress within the day, an earlier
    // time means the journey crossed midnight — both are valid. Only an
    // identical time as the previous stop is rejected.
    shouldOutwardDifferFromPrev: (
      stop: Pick<FormFieldsStopInput, 'outwardTime'>,
      index: number
    ) => {
      if (index === 0) return true;
      const prevStop = data.stops[index - 1];
      return (
        !stop.outwardTime ||
        !prevStop?.outwardTime ||
        stop.outwardTime !== prevStop.outwardTime
      );
    },

    // Same reasoning for the return leg: distinct adjacent times are valid
    // (a smaller value simply crossed midnight), identical ones are not.
    shouldInwardDifferFromPrev: (
      stop: Pick<FormFieldsStopInput, 'inwardTime'>,
      index: number
    ) => {
      if (index === 0 || !isRound) return true;
      const prevStop = data.stops[index - 1];
      return (
        !stop.inwardTime ||
        !prevStop?.inwardTime ||
        stop.inwardTime !== prevStop.inwardTime
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

  // Cumulative day offset per stop along the real trip chronology, so a leg
  // that crosses midnight pushes everything after it to the next day.
  const dayOffsets = computeDayOffsets(data.stops);

  return {
    isToday,
    ...stopOrderRules,

    isOutwardInFuture: (stop: FormFieldsStopInput, index: number) => {
      if (isInPast) return false;
      if (!isToday) return true;
      if (!stop.outwardTime) return true;
      return isTimeInFuture(
        data.date,
        stop.outwardTime,
        dayOffsets.outward[index] ?? 0
      );
    },

    isInwardInFuture: (stop: FormFieldsStopInput, index: number) => {
      if (isInPast) return false;
      if (!isToday) return true;
      if (!stopOrderRules.isRound) return true;
      if (!stop.inwardTime) return true;
      return isTimeInFuture(
        data.date,
        stop.inwardTime,
        dayOffsets.inward[index] ?? 0
      );
    },
  };
};
