import { describe, expect, it } from 'vitest';

import { getUserBookingStatus } from '@/features/booking/status-colors';

const makeCommute = (
  driverId: string,
  passengers: Array<{ id: string; status: string }>
) => ({
  driver: { id: driverId },
  stops: [
    {
      passengers: passengers.map((p) => ({
        status: p.status as 'REQUESTED' | 'ACCEPTED' | 'REFUSED' | 'CANCELED',
        passenger: { id: p.id },
      })),
    },
  ],
});

describe('getUserBookingStatus', () => {
  it('returns DRIVER when the user is the driver', () => {
    expect(getUserBookingStatus(makeCommute('user1', []), 'user1')).toBe(
      'DRIVER'
    );
  });

  it('returns OUTSIDER when user has no booking', () => {
    expect(getUserBookingStatus(makeCommute('driver', []), 'user1')).toBe(
      'OUTSIDER'
    );
  });

  it('returns the booking status for a single booking', () => {
    const commute = makeCommute('driver', [
      { id: 'user1', status: 'REQUESTED' },
    ]);
    expect(getUserBookingStatus(commute, 'user1')).toBe('REQUESTED');
  });

  describe(
    'non-regression: prioritizes active booking over canceled',
    { tags: ['non-regression'] },
    () => {
      it('returns REQUESTED when user has both CANCELED and REQUESTED bookings', () => {
        const commute = {
          driver: { id: 'driver' },
          stops: [
            {
              passengers: [
                {
                  status: 'CANCELED' as const,
                  passenger: { id: 'user1' },
                },
              ],
            },
            {
              passengers: [
                {
                  status: 'REQUESTED' as const,
                  passenger: { id: 'user1' },
                },
              ],
            },
          ],
        };
        expect(getUserBookingStatus(commute, 'user1')).toBe('REQUESTED');
      });

      it('returns ACCEPTED when user has both CANCELED and ACCEPTED bookings', () => {
        const commute = {
          driver: { id: 'driver' },
          stops: [
            {
              passengers: [
                {
                  status: 'CANCELED' as const,
                  passenger: { id: 'user1' },
                },
              ],
            },
            {
              passengers: [
                {
                  status: 'ACCEPTED' as const,
                  passenger: { id: 'user1' },
                },
              ],
            },
          ],
        };
        expect(getUserBookingStatus(commute, 'user1')).toBe('ACCEPTED');
      });

      it('returns ACCEPTED over REQUESTED', () => {
        const commute = {
          driver: { id: 'driver' },
          stops: [
            {
              passengers: [
                {
                  status: 'REQUESTED' as const,
                  passenger: { id: 'user1' },
                },
              ],
            },
            {
              passengers: [
                {
                  status: 'ACCEPTED' as const,
                  passenger: { id: 'user1' },
                },
              ],
            },
          ],
        };
        expect(getUserBookingStatus(commute, 'user1')).toBe('ACCEPTED');
      });
    }
  );
});
