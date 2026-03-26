import { describe, expect, it } from 'vitest';

import { validateStatusTransition } from '@/features/booking/status-machine';

describe('validateStatusTransition', () => {
  it.each([
    ['REQUESTED', 'ACCEPTED'],
    ['REQUESTED', 'REFUSED'],
    ['REQUESTED', 'CANCELED'],
    ['ACCEPTED', 'CANCELED'],
    ['REFUSED', 'REQUESTED'],
    ['CANCELED', 'REQUESTED'],
  ] as const)('should allow %s → %s', (from, to) => {
    expect(() => validateStatusTransition(from, to)).not.toThrow();
  });

  it.each([
    ['ACCEPTED', 'ACCEPTED'],
    ['ACCEPTED', 'REFUSED'],
    ['REFUSED', 'ACCEPTED'],
    ['REFUSED', 'CANCELED'],
    ['CANCELED', 'ACCEPTED'],
    ['CANCELED', 'REFUSED'],
  ] as const)('should reject %s → %s', (from, to) => {
    expect(() => validateStatusTransition(from, to)).toThrow(
      expect.objectContaining({
        code: 'BAD_REQUEST',
        message: `Cannot transition from ${from} to ${to}`,
      })
    );
  });
});
