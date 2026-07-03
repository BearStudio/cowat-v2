import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createCommuteRules } from '@/features/commute/form-commute-rules';
import { zFormFieldsCommute } from '@/features/commute/schema';
import {
  computeDayOffsets,
  isNextDay,
  stopDayLabel,
  tripCrossesMidnight,
} from '@/features/commute/time-utils';

// Freeze "now" so the today/future checks are deterministic.
const NOW = new Date('2026-06-29T10:59:00');
const TODAY = new Date('2026-06-29T08:00:00');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

const roundTrip = (
  stops: Array<{ outwardTime: string; inwardTime?: string | null }>
) => ({
  date: TODAY,
  seats: 1,
  type: 'ROUND' as const,
  comment: null,
  stops: stops.map((s, i) => ({ ...s, locationId: `loc-${i}` })),
});

describe('isNextDay', () => {
  it('flags a clock value smaller than the reference as next day', () => {
    expect(isNextDay('23:30', '02:00')).toBe(true);
    expect(isNextDay('15:00', '02:00')).toBe(true);
  });

  it('does not flag a later or equal time', () => {
    expect(isNextDay('08:00', '17:00')).toBe(false);
    expect(isNextDay('23:30', '23:30')).toBe(false);
  });

  it('is safe with missing values', () => {
    expect(isNextDay(undefined, '02:00')).toBe(false);
    expect(isNextDay('23:30', null)).toBe(false);
  });
});

describe('computeDayOffsets', () => {
  it('keeps everything on day 0 when nothing crosses midnight', () => {
    const { outward, inward } = computeDayOffsets([
      { outwardTime: '08:00', inwardTime: '17:30' },
      { outwardTime: '08:30', inwardTime: '17:00' },
    ]);
    expect(outward).toEqual([0, 0]);
    expect(inward).toEqual([0, 0]);
  });

  it('flags the return as next day when it crosses midnight', () => {
    const { outward, inward } = computeDayOffsets([
      { outwardTime: '15:00', inwardTime: '02:20' },
      { outwardTime: '15:30', inwardTime: '02:00' },
    ]);
    expect(outward).toEqual([0, 0]);
    expect(inward).toEqual([1, 1]);
  });

  it('forces the return departure to next day when the outward leg crosses midnight', () => {
    // Departure 23:30 (day 0), arrival 00:15 (day 1). The return departs from
    // the arrival stop at 23:45 — a larger clock value than the departure, yet
    // it must still be the next day because the outward already crossed.
    const { outward, inward } = computeDayOffsets([
      { outwardTime: '23:30', inwardTime: '00:30' },
      { outwardTime: '00:15', inwardTime: '23:45' },
    ]);
    expect(outward).toEqual([0, 1]);
    // Return departure (index 1) is forced to day 1 even though 23:45 > 23:30.
    expect(inward[1]).toBe(1);
  });
});

describe('tripCrossesMidnight', () => {
  it('is false when nothing crosses midnight', () => {
    const stops = [
      { outwardTime: '08:00', inwardTime: '17:30' },
      { outwardTime: '08:30', inwardTime: '17:00' },
    ];
    expect(tripCrossesMidnight(stops, computeDayOffsets(stops))).toBe(false);
  });

  it('is true as soon as one leg crosses midnight', () => {
    const stops = [
      { outwardTime: '15:00', inwardTime: '02:20' },
      { outwardTime: '15:30', inwardTime: '02:00' },
    ];
    expect(tripCrossesMidnight(stops, computeDayOffsets(stops))).toBe(true);
  });

  it('ignores a day offset carried by a missing inward time', () => {
    const stops = [
      { outwardTime: '08:00', inwardTime: null },
      { outwardTime: '08:30', inwardTime: null },
    ];
    expect(tripCrossesMidnight(stops, computeDayOffsets(stops))).toBe(false);
  });
});

describe('stopDayLabel', () => {
  // Mirrors the offset-aware i18n fallback: "Jour J" at 0, "Lendemain" at +1,
  // "+N jours" beyond.
  const dayBadge = (offset: number) =>
    offset === 0 ? 'Jour J' : offset === 1 ? 'Lendemain' : `+${offset} jours`;

  it('shows no badge when the trip stays on a single day', () => {
    expect(stopDayLabel(0, false, dayBadge)).toBeNull();
    expect(stopDayLabel(1, false, dayBadge)).toBeNull();
  });

  it('labels a day-0 stop with "Jour J" when the trip crosses midnight', () => {
    expect(stopDayLabel(0, true, dayBadge)).toBe('Jour J');
  });

  it('labels a shifted stop with a relative day badge once the trip crosses midnight', () => {
    expect(stopDayLabel(1, true, dayBadge)).toBe('Lendemain');
    expect(stopDayLabel(2, true, dayBadge)).toBe('+2 jours');
    expect(stopDayLabel(3, true, dayBadge)).toBe('+3 jours');
  });
});

describe('createCommuteRules — return crossing midnight (today)', () => {
  // Reported bug: departure 15:00, return 02:00 the next day.
  // Built inside `beforeEach` (after the fake timers are set) so the "now"
  // captured by createCommuteRules is the frozen NOW, not the real clock.
  let data: ReturnType<typeof roundTrip>;
  let rules: ReturnType<typeof createCommuteRules>;
  beforeEach(() => {
    data = roundTrip([
      { outwardTime: '15:00', inwardTime: '02:20' },
      { outwardTime: '15:30', inwardTime: '02:00' },
    ]);
    rules = createCommuteRules(data);
  });

  it('accepts the return order (02:00 is read as next day)', () => {
    expect(rules.shouldInwardDifferFromOutward(data.stops[1]!)).toBe(true);
  });

  it('treats the next-day return as being in the future', () => {
    expect(rules.isInwardInFuture(data.stops[0]!, 0)).toBe(true);
    expect(rules.isInwardInFuture(data.stops[1]!, 1)).toBe(true);
  });

  it('keeps the outward times valid', () => {
    expect(rules.isOutwardInFuture(data.stops[0]!, 0)).toBe(true);
    expect(rules.isOutwardInFuture(data.stops[1]!, 1)).toBe(true);
  });
});

describe('createCommuteRules — outward leg crossing midnight (today)', () => {
  it('treats the post-midnight arrival outward time as next day (future)', () => {
    // Departure 23:30, arrival 00:15 the next day. Built inside the test so it
    // sees the frozen NOW set by the fake timers.
    const data = roundTrip([
      { outwardTime: '23:30', inwardTime: '02:30' },
      { outwardTime: '00:15', inwardTime: '02:00' },
    ]);
    const rules = createCommuteRules(data);
    expect(rules.isOutwardInFuture(data.stops[1]!, 1)).toBe(true);
  });
});

describe('createCommuteRules — genuine errors are still caught', () => {
  it('rejects an outward time already past today (no midnight crossing)', () => {
    const data = roundTrip([
      { outwardTime: '08:00', inwardTime: '17:00' },
      { outwardTime: '09:00', inwardTime: '16:30' },
    ]);
    const rules = createCommuteRules(data);
    expect(rules.isOutwardInFuture(data.stops[0]!, 0)).toBe(false);
  });

  it('rejects an identical outward/inward time', () => {
    const data = roundTrip([{ outwardTime: '23:30', inwardTime: '23:30' }]);
    const rules = createCommuteRules(data);
    expect(rules.shouldInwardDifferFromOutward(data.stops[0]!)).toBe(false);
  });
});

describe('zFormFieldsCommute — end to end', () => {
  it('validates a round trip whose return crosses midnight', () => {
    const result = zFormFieldsCommute().safeParse(
      roundTrip([
        { outwardTime: '23:30', inwardTime: '02:20' },
        { outwardTime: '23:50', inwardTime: '02:00' },
      ])
    );
    expect(result.success).toBe(true);
  });
});
