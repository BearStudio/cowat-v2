import { call } from '@orpc/server';
import { describe, expect, it } from 'vitest';

import statsRouter from '@/server/routers/stats';
import { mockDb, mockGetSession } from '@/server/routers/test-utils';

const mockUserFromDb = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  image: null,
  _count: {
    commutes: 2,
    passengerBookings: 3,
    commuteTemplates: 1,
  },
};

describe('stats router', () => {
  describe('getAll', () => {
    it('should return user stats', async () => {
      mockDb.user.findMany.mockResolvedValue([mockUserFromDb]);
      mockDb.commute.findMany.mockResolvedValue([]);

      const result = await call(statsRouter.getAll, undefined);

      expect(result.users).toEqual([
        {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          image: null,
          commuteCount: 2,
          bookingCount: 3,
          templateCount: 1,
          stopCount: 0,
        },
      ]);
    });

    it('should return empty users when no users exist', async () => {
      mockDb.user.findMany.mockResolvedValue([]);
      mockDb.commute.findMany.mockResolvedValue([]);

      const result = await call(statsRouter.getAll, undefined);

      expect(result.users).toEqual([]);
    });

    it('should compute stopCount from commutes', async () => {
      mockDb.user.findMany.mockResolvedValue([mockUserFromDb]);
      mockDb.commute.findMany.mockResolvedValue([
        { driverId: 'user-1', _count: { stops: 5 } },
      ]);

      const result = await call(statsRouter.getAll, undefined);

      expect(result.users[0]!.stopCount).toBe(5);
    });

    it('should sum stopCount across multiple commutes for the same driver', async () => {
      mockDb.user.findMany.mockResolvedValue([mockUserFromDb]);
      mockDb.commute.findMany.mockResolvedValue([
        { driverId: 'user-1', _count: { stops: 3 } },
        { driverId: 'user-1', _count: { stops: 4 } },
      ]);

      const result = await call(statsRouter.getAll, undefined);

      expect(result.users[0]!.stopCount).toBe(7);
    });

    it('should return stats for multiple users', async () => {
      const secondUser = {
        id: 'user-2',
        name: 'Other User',
        email: 'other@example.com',
        image: null,
        _count: { commutes: 0, passengerBookings: 1, commuteTemplates: 0 },
      };
      mockDb.user.findMany.mockResolvedValue([mockUserFromDb, secondUser]);
      mockDb.commute.findMany.mockResolvedValue([]);

      const result = await call(statsRouter.getAll, undefined);

      expect(result.users).toHaveLength(2);
      expect(result.users[1]).toEqual({
        id: 'user-2',
        name: 'Other User',
        email: 'other@example.com',
        image: null,
        commuteCount: 0,
        bookingCount: 1,
        templateCount: 0,
        stopCount: 0,
      });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(call(statsRouter.getAll, undefined)).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });
});
