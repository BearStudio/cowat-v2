import { call } from '@orpc/server';
import { describe, expect, it } from 'vitest';

import statsRouter from '@/server/routers/stats';
import {
  mockDb,
  mockGetSession,
  mockOrganizationId,
} from '@/server/routers/test-utils';

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

    it('should scope user query by organizationId', async () => {
      mockDb.user.findMany.mockResolvedValue([]);
      mockDb.commute.findMany.mockResolvedValue([]);

      await call(statsRouter.getAll, undefined);

      expect(mockDb.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            members: { some: { organizationId: mockOrganizationId } },
          },
        })
      );
    });

    it('should scope passengerBookings count by organizationId', async () => {
      mockDb.user.findMany.mockResolvedValue([]);
      mockDb.commute.findMany.mockResolvedValue([]);

      await call(statsRouter.getAll, undefined);

      expect(mockDb.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            _count: {
              select: expect.objectContaining({
                passengerBookings: {
                  where: {
                    stop: {
                      commute: {
                        organizationId: mockOrganizationId,
                      },
                    },
                  },
                },
              }),
            },
          }),
        })
      );
    });

    it('should scope commute counts by organizationId', async () => {
      mockDb.user.findMany.mockResolvedValue([]);
      mockDb.commute.findMany.mockResolvedValue([]);

      await call(statsRouter.getAll, undefined);

      expect(mockDb.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            _count: {
              select: expect.objectContaining({
                commutes: {
                  where: { organizationId: mockOrganizationId },
                },
                commuteTemplates: {
                  where: { organizationId: mockOrganizationId },
                },
              }),
            },
          }),
        })
      );
    });

    it('should scope commute findMany by organizationId', async () => {
      mockDb.user.findMany.mockResolvedValue([]);
      mockDb.commute.findMany.mockResolvedValue([]);

      await call(statsRouter.getAll, undefined);

      expect(mockDb.commute.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: mockOrganizationId },
        })
      );
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(call(statsRouter.getAll, undefined)).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });
});
