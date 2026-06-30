import dayjs from 'dayjs';
import '@/lib/dayjs/config';

/**
 * Time helpers shared across the commute / commute-template features.
 *
 * Times are stored as "HH:mm" strings. Because a stop has no date of its
 * own, a return ("inward") time that is earlier than the outward time is
 * interpreted as happening the next day rather than being rejected.
 */

export const timeToMinutes = (time: string): number => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  // Normalise onto [0, 1440) so negative or >24h values (e.g. an auto-computed
  // inward time when the outward leg crosses midnight) wrap to a valid wall
  // clock. The error is always a whole number of days, which the modulo erases.
  const total = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * True when `time` falls on the day after `referenceTime`, i.e. it crosses
 * midnight relative to the trip's anchor (the departure time).
 *
 * A commute is anchored at its first outward time; any later time whose
 * clock value is smaller has wrapped past midnight (e.g. departure 23:30,
 * arrival 00:15, or departure 15:00, return 02:00).
 *
 * Strict comparison: a time equal to the reference is not a next-day case
 * (an identical time is rejected as invalid by the validation rules).
 */
export const isNextDay = (
  referenceTime?: string | null,
  time?: string | null
): boolean =>
  !!referenceTime &&
  !!time &&
  timeToMinutes(time) < timeToMinutes(referenceTime);

type DayOffsetStop = {
  outwardTime?: string | null;
  inwardTime?: string | null;
};

type DayOffsets = { outward: number[]; inward: number[] };

/**
 * Cumulative day offset (0 = same day as the commute date, 1 = next day, …)
 * for every stop, following the real chronology of the trip.
 *
 * The offset only ever increases along the timeline, so once the journey has
 * crossed midnight everything after it stays on the next day — even if its
 * clock value looks "earlier". For example, if the outward leg arrives after
 * midnight, the return departure from that same stop is necessarily the next
 * day too, whatever its clock value.
 *
 * - Outward: stops in array order; each backward clock jump adds a day.
 * - Inward: chronological order is the reverse (the return departs from the
 *   last stop, where the outward arrived, then works back to the first stop).
 */
export const computeDayOffsets = (
  stops: ReadonlyArray<DayOffsetStop | undefined>
): { outward: number[]; inward: number[] } => {
  const n = stops.length;
  const outward: number[] = Array.from({ length: n }, () => 0);
  const inward: number[] = Array.from({ length: n }, () => 0);

  for (let i = 1; i < n; i++) {
    const crossed = isNextDay(stops[i - 1]?.outwardTime, stops[i]?.outwardTime);
    outward[i] = (outward[i - 1] ?? 0) + (crossed ? 1 : 0);
  }

  for (let i = n - 1; i >= 0; i--) {
    if (i === n - 1) {
      // Return departs from the last stop, after the outward arrived there.
      const crossed = isNextDay(stops[i]?.outwardTime, stops[i]?.inwardTime);
      inward[i] = (outward[i] ?? 0) + (crossed ? 1 : 0);
    } else {
      // The chronologically previous return event is the next stop by index.
      const crossed = isNextDay(stops[i + 1]?.inwardTime, stops[i]?.inwardTime);
      inward[i] = (inward[i + 1] ?? 0) + (crossed ? 1 : 0);
    }
  }

  return { outward, inward };
};

/**
 * Elapsed minutes of the outward leg (first → last stop), accounting for any
 * midnight crossing via the cumulative day offset. So an outward leg from
 * 23:30 to 00:15 is 45 min, not a negative raw-clock difference. Always >= 0.
 */
export const outwardDurationMinutes = (
  stops: ReadonlyArray<DayOffsetStop | undefined>,
  // Optional precomputed offsets, so callers that already have them (e.g.
  // alongside `computeStopDayLabels`) don't pay for a second computation.
  precomputedOffsets?: DayOffsets
): number => {
  const first = stops[0];
  const last = stops[stops.length - 1];
  if (stops.length < 2 || !first?.outwardTime || !last?.outwardTime) return 0;
  const { outward } = precomputedOffsets ?? computeDayOffsets(stops);
  return (
    timeToMinutes(last.outwardTime) +
    (outward[stops.length - 1] ?? 0) * 1440 -
    timeToMinutes(first.outwardTime)
  );
};

/**
 * A trip date shifted by `dayOffset` days, formatted with the shared
 * `common:short` date format (rather than a hardcoded pattern) so the day
 * badges follow the project-wide date convention.
 */
export const formatTripDate = (tripDate: Date, dayOffset: number): string =>
  dayjs(tripDate).add(dayOffset, 'day').f('common:short');

/**
 * True when at least one leg of the trip crosses midnight, i.e. a stop lands
 * on a later day than the commute date. A missing inward time never counts.
 */
export const tripCrossesMidnight = (
  stops: ReadonlyArray<DayOffsetStop | undefined>,
  dayOffsets: DayOffsets
): boolean =>
  stops.some(
    (s, i) =>
      (dayOffsets.outward[i] ?? 0) >= 1 ||
      (!!s?.inwardTime && (dayOffsets.inward[i] ?? 0) >= 1)
  );

/**
 * Per-stop day badge label, shared by the form steps and the recap so they
 * stay consistent.
 *
 * As soon as the trip crosses midnight at least once (`hasDayChange`), **every**
 * stop carries a label so the reader can tell the days apart — its exact date
 * when the trip date is known, or the generic `fallback` (next-day) for dateless
 * templates (and only on the crossed stops in that case). No crossing → no
 * per-stop badge at all.
 */
export const stopDayLabel = (
  tripDate: Date | null | undefined,
  dayOffset: number,
  hasDayChange: boolean,
  fallback: string
): string | null => {
  if (!hasDayChange) return null;
  if (tripDate) return formatTripDate(tripDate, dayOffset);
  return dayOffset >= 1 ? fallback : null;
};

export type StopDayLabels = {
  outwardDayLabel: string | null;
  inwardDayLabel: string | null;
  // Raw cumulative day offset (0 = trip date, 1 = next day, …) so the day badge
  // can render a compact "+N" form on mobile instead of the full date label.
  outwardDayOffset: number;
  inwardDayOffset: number;
};

/**
 * Per-stop day badge labels (outward + inward) for a whole trip, ready to be
 * merged into the timeline stops. Centralises the day-offset computation so the
 * form recap and the read-only consultation views stay consistent.
 *
 * The inward label is only produced when the stop actually carries a return
 * time. Each stop keeps its original index, so the offsets line up with the
 * array order (no reversing needed by the caller).
 */
export const computeStopDayLabels = (
  stops: ReadonlyArray<DayOffsetStop | undefined>,
  tripDate: Date | null | undefined,
  fallback: string,
  // Optional precomputed offsets, shared with callers that also need the raw
  // offsets (e.g. to compute the trip duration) to avoid recomputing them.
  precomputedOffsets?: DayOffsets
): StopDayLabels[] => {
  const dayOffsets = precomputedOffsets ?? computeDayOffsets(stops);
  const hasDayChange = tripCrossesMidnight(stops, dayOffsets);
  return stops.map((stop, i) => ({
    outwardDayLabel: stopDayLabel(
      tripDate,
      dayOffsets.outward[i] ?? 0,
      hasDayChange,
      fallback
    ),
    inwardDayLabel: stop?.inwardTime
      ? stopDayLabel(
          tripDate,
          dayOffsets.inward[i] ?? 0,
          hasDayChange,
          fallback
        )
      : null,
    outwardDayOffset: dayOffsets.outward[i] ?? 0,
    inwardDayOffset: dayOffsets.inward[i] ?? 0,
  }));
};
