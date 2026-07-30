import { describe, expect, it } from 'vitest';

import { fromDateParam, toDateParam } from '@/lib/dayjs/date-param';

describe('date-param', () => {
  it('serializes a date to a calendar day', () => {
    expect(toDateParam(new Date(2026, 6, 30, 23, 30))).toBe('2026-07-30');
    expect(toDateParam(new Date(2026, 6, 30, 0, 30))).toBe('2026-07-30');
  });

  it('parses a calendar day to noon UTC', () => {
    expect(fromDateParam('2026-07-30').toISOString()).toBe(
      '2026-07-30T12:00:00.000Z'
    );
  });

  it('parses legacy full ISO params', () => {
    expect(fromDateParam('2026-07-30T12:00:00.000Z').toISOString()).toBe(
      '2026-07-30T12:00:00.000Z'
    );
  });

  it('round-trips without drifting', () => {
    const param = '2026-07-30';
    expect(toDateParam(fromDateParam(param))).toBe(param);
  });
});
