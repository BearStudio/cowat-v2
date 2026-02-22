import { call } from '@orpc/server';
import { describe, expect, it } from 'vitest';

import statsRouter from '@/server/routers/stats';
import {
  mockDb,
  mockGetSession,
  mockMemberId,
  mockOrganizationId,
} from '@/server/routers/test-utils';

const mockMemberFromDb = {
  id: mockMemberId,
  user: {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    image: null,
  },
  _count: {
    drivenCommutes: 2,
    passengerBookings: 3,
    drivenTemplates: 1,
  },
};

describe('stats router', () => {
  describe('getAll', () => {
    it('should return user stats', async () => {
      mockDb.member.findMany.mockResolvedValue([mockMemberFromDb]);
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

    it('should scope member query by organizationId', async () => {
      mockDb.member.findMany.mockResolvedValue([]);
      mockDb.commute.findMany.mockResolvedValue([]);

      await call(statsRouter.getAll, undefined);

      expect(mockDb.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: mockOrganizationId },
        })
      );
    });

    it('should apply date range filter to commute counts when from/to are provided', async () => {
      mockDb.member.findMany.mockResolvedValue([]);
      mockDb.commute.findMany.mockResolvedValue([]);

      const from = new Date('2025-01-01');
      const to = new Date('2025-12-31');

      await call(statsRouter.getAll, { from, to });

      expect(mockDb.commute.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: { gte: from, lt: to },
          }),
        })
      );
    });

    it('should not apply date filter when no date range is provided', async () => {
      mockDb.member.findMany.mockResolvedValue([]);
      mockDb.commute.findMany.mockResolvedValue([]);

      await call(statsRouter.getAll, undefined);

      expect(mockDb.commute.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { driver: { organizationId: mockOrganizationId } },
        })
      );
    });

    it('should include user info and relation counts on member', async () => {
      mockDb.member.findMany.mockResolvedValue([]);
      mockDb.commute.findMany.mockResolvedValue([]);

      await call(statsRouter.getAll, undefined);

      expect(mockDb.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            _count: {
              select: {
                drivenCommutes: true,
                passengerBookings: true,
                drivenTemplates: true,
              },
            },
          },
        })
      );
    });

    it('should scope commute findMany by driver organizationId', async () => {
      mockDb.member.findMany.mockResolvedValue([]);
      mockDb.commute.findMany.mockResolvedValue([]);

      await call(statsRouter.getAll, undefined);

      expect(mockDb.commute.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { driver: { organizationId: mockOrganizationId } },
        })
      );
    });

    it('should aggregate stop counts per member', async () => {
      mockDb.member.findMany.mockResolvedValue([mockMemberFromDb]);
      mockDb.commute.findMany.mockResolvedValue([
        { driverMemberId: mockMemberId, _count: { stops: 3 } },
        { driverMemberId: mockMemberId, _count: { stops: 2 } },
      ]);

      const result = await call(statsRouter.getAll, undefined);

      expect(result.users[0]!.stopCount).toBe(5);
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(call(statsRouter.getAll, undefined)).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });
});
