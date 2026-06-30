import { describe, expect, it } from 'vitest';

import {
  computeStopDayLabels,
  minutesToTime,
  outwardDurationMinutes,
  timeToMinutes,
} from '@/features/commute/time-utils';

const TRIP_DATE = new Date('2026-06-29T00:00:00');

describe('minutesToTime', () => {
  it('formats a regular time', () => {
    expect(minutesToTime(timeToMinutes('08:05'))).toBe('08:05');
    expect(minutesToTime(timeToMinutes('23:59'))).toBe('23:59');
    expect(minutesToTime(0)).toBe('00:00');
  });

  it('wraps values past midnight', () => {
    // 24:30 -> 00:30 the next day
    expect(minutesToTime(24 * 60 + 30)).toBe('00:30');
  });

  it('never produces an invalid time, even for negative minutes', () => {
    // Reachable via the auto-computed inward times when the OUTWARD leg
    // crosses midnight: lastInward + (lastOutward - stopOutward) can go
    // negative, e.g. last outward 00:15, stop0 outward 23:30, last inward 01:00
    //   => 60 + (15 - 1410) = -1335
    const result = minutesToTime(60 + (15 - 1410));
    expect(result).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
  });
});

describe('outwardDurationMinutes', () => {
  it('computes a same-day outward duration', () => {
    expect(
      outwardDurationMinutes([
        { outwardTime: '08:00' },
        { outwardTime: '09:30' },
      ])
    ).toBe(90);
  });

  it('returns a real elapsed time when the outward leg crosses midnight', () => {
    // 23:30 -> 00:15 is 45 min, not -1395 (the raw clock difference).
    expect(
      outwardDurationMinutes([
        { outwardTime: '23:30' },
        { outwardTime: '00:15' },
      ])
    ).toBe(45);
  });

  it('accumulates across several stops crossing midnight', () => {
    // 22:00 -> 23:00 -> 01:00 spans 3h.
    expect(
      outwardDurationMinutes([
        { outwardTime: '22:00' },
        { outwardTime: '23:00' },
        { outwardTime: '01:00' },
      ])
    ).toBe(180);
  });

  it('is safe with fewer than two stops or missing times', () => {
    expect(outwardDurationMinutes([{ outwardTime: '08:00' }])).toBe(0);
    expect(outwardDurationMinutes([])).toBe(0);
  });
});

describe('computeStopDayLabels', () => {
  it('produces no labels when the trip stays on one day', () => {
    const labels = computeStopDayLabels(
      [
        { outwardTime: '08:00', inwardTime: '17:30' },
        { outwardTime: '08:30', inwardTime: '17:00' },
      ],
      TRIP_DATE,
      'Lendemain'
    );
    expect(labels).toEqual([
      {
        outwardDayLabel: null,
        inwardDayLabel: null,
        outwardDayOffset: 0,
        inwardDayOffset: 0,
      },
      {
        outwardDayLabel: null,
        inwardDayLabel: null,
        outwardDayOffset: 0,
        inwardDayOffset: 0,
      },
    ]);
  });

  it('labels every stop with its exact date when the return crosses midnight', () => {
    // Outward stays on day 0, the return (02:00) is read as the next day.
    const labels = computeStopDayLabels(
      [
        { outwardTime: '15:00', inwardTime: '02:20' },
        { outwardTime: '15:30', inwardTime: '02:00' },
      ],
      TRIP_DATE,
      'Lendemain'
    );
    expect(labels).toEqual([
      {
        outwardDayLabel: '29/06/2026',
        inwardDayLabel: '30/06/2026',
        outwardDayOffset: 0,
        inwardDayOffset: 1,
      },
      {
        outwardDayLabel: '29/06/2026',
        inwardDayLabel: '30/06/2026',
        outwardDayOffset: 0,
        inwardDayOffset: 1,
      },
    ]);
  });

  it('falls back to the generic label on crossed stops when there is no date (templates)', () => {
    const labels = computeStopDayLabels(
      [
        { outwardTime: '15:00', inwardTime: '02:20' },
        { outwardTime: '15:30', inwardTime: '02:00' },
      ],
      null,
      'Lendemain'
    );
    // Day-0 outward stops get no badge, only the next-day returns do.
    expect(labels).toEqual([
      {
        outwardDayLabel: null,
        inwardDayLabel: 'Lendemain',
        outwardDayOffset: 0,
        inwardDayOffset: 1,
      },
      {
        outwardDayLabel: null,
        inwardDayLabel: 'Lendemain',
        outwardDayOffset: 0,
        inwardDayOffset: 1,
      },
    ]);
  });

  it('never sets an inward label when the stop has no return time', () => {
    const labels = computeStopDayLabels(
      [
        { outwardTime: '23:30', inwardTime: null },
        { outwardTime: '00:15', inwardTime: null },
      ],
      TRIP_DATE,
      'Lendemain'
    );
    expect(labels[0]?.inwardDayLabel).toBeNull();
    expect(labels[1]?.inwardDayLabel).toBeNull();
    // The outward leg crosses midnight, so the post-midnight stop is day 1.
    expect(labels[1]?.outwardDayLabel).toBe('30/06/2026');
  });
});
