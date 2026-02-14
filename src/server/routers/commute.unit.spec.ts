import { call } from '@orpc/server';
import { describe, expect, it } from 'vitest';

import { Prisma } from '@/server/db/generated/client';
import commuteRouter from '@/server/routers/commute';
import { mockDb, mockGetSession, mockUser } from '@/server/routers/test-utils';

const now = new Date();

const mockStop = {
  id: 'stop-1',
  order: 0,
  outwardTime: '08:30',
  inwardTime: '17:45',
  locationId: 'location-1',
  commuteId: 'commute-1',
  createdAt: now,
  updatedAt: now,
};

const mockStopEnriched = {
  ...mockStop,
  location: { id: 'location-1', name: 'Office' },
  passengers: [],
};

const mockCommuteFromDb = {
  id: 'commute-1',
  date: new Date('2025-06-15'),
  seats: 3,
  type: 'ROUND' as const,
  status: 'UNKNOWN' as const,
  delay: null,
  comment: null,
  driverId: mockUser.id,
  createdAt: now,
  updatedAt: now,
  stops: [mockStop],
};

const mockCommuteEnrichedFromDb = {
  ...mockCommuteFromDb,
  driver: { id: mockUser.id, name: mockUser.name, image: null },
  stops: [mockStopEnriched],
};

describe('commute router', () => {
  describe('create', () => {
    const createInput = {
      date: new Date('2025-06-15'),
      seats: 3,
      type: 'ROUND' as const,
      comment: null,
      stops: [
        {
          order: 0,
          outwardTime: '08:30',
          inwardTime: '17:45',
          locationId: 'location-1',
        },
      ],
    };

    it('should create a commute with stops and return it', async () => {
      mockDb.commute.create.mockResolvedValue(mockCommuteFromDb);

      const result = await call(commuteRouter.create, createInput);

      expect(result).toEqual(mockCommuteFromDb);
      expect(mockDb.commute.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            date: createInput.date,
            seats: createInput.seats,
            type: createInput.type,
            driverId: mockUser.id,
            stops: expect.objectContaining({
              create: createInput.stops,
            }),
          }),
        })
      );
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(commuteRouter.create, createInput)
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should throw BAD_REQUEST on foreign key violation (P2003)', async () => {
      mockDb.commute.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Foreign key constraint', {
          code: 'P2003',
          clientVersion: '0.0.0',
          meta: { field_name: 'location_id' },
        })
      );

      await expect(
        call(commuteRouter.create, createInput)
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should throw INTERNAL_SERVER_ERROR on unexpected errors', async () => {
      mockDb.commute.create.mockRejectedValue(new Error('DB connection lost'));

      await expect(
        call(commuteRouter.create, createInput)
      ).rejects.toMatchObject({ code: 'INTERNAL_SERVER_ERROR' });
    });
  });

  describe('getById', () => {
    it('should return a commute with stops when found', async () => {
      mockDb.commute.findUnique.mockResolvedValue(mockCommuteFromDb);

      const result = await call(commuteRouter.getById, { id: 'commute-1' });

      expect(result).toEqual(mockCommuteFromDb);
    });

    it('should throw NOT_FOUND when commute does not exist', async () => {
      mockDb.commute.findUnique.mockResolvedValue(null);

      await expect(
        call(commuteRouter.getById, { id: 'nonexistent' })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(commuteRouter.getById, { id: 'commute-1' })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  describe('getByDate', () => {
    const dateRange = {
      from: new Date('2025-06-15'),
      to: new Date('2025-06-22'),
    };

    it('should return enriched commutes for the given date range', async () => {
      mockDb.commute.findMany.mockResolvedValue([mockCommuteEnrichedFromDb]);

      const result = await call(commuteRouter.getByDate, dateRange);

      expect(result).toEqual([mockCommuteEnrichedFromDb]);
      expect(mockDb.commute.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { date: { gte: dateRange.from, lt: dateRange.to } },
          orderBy: { date: 'asc' },
        })
      );
    });

    it('should return empty array when no commutes in range', async () => {
      mockDb.commute.findMany.mockResolvedValue([]);

      const result = await call(commuteRouter.getByDate, dateRange);

      expect(result).toEqual([]);
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(commuteRouter.getByDate, dateRange)
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  describe('getMyCommutes', () => {
    it('should return paginated commutes for the current user', async () => {
      mockDb.commute.count.mockResolvedValue(1);
      mockDb.commute.findMany.mockResolvedValue([mockCommuteEnrichedFromDb]);

      const result = await call(commuteRouter.getMyCommutes, {});

      expect(result).toEqual({
        items: [mockCommuteEnrichedFromDb],
        nextCursor: undefined,
        total: 1,
      });
    });

    it('should return nextCursor when there are more items than limit', async () => {
      const commutes = Array.from({ length: 4 }, (_, i) => ({
        ...mockCommuteEnrichedFromDb,
        id: `commute-${i + 1}`,
      }));
      mockDb.commute.count.mockResolvedValue(10);
      mockDb.commute.findMany.mockResolvedValue(commutes);

      const result = await call(commuteRouter.getMyCommutes, { limit: 3 });

      expect(result.items).toHaveLength(3);
      expect(result.nextCursor).toBe('commute-4');
      expect(result.total).toBe(10);
    });

    it('should not return nextCursor when items fit within limit', async () => {
      mockDb.commute.count.mockResolvedValue(1);
      mockDb.commute.findMany.mockResolvedValue([mockCommuteEnrichedFromDb]);

      const result = await call(commuteRouter.getMyCommutes, { limit: 5 });

      expect(result.nextCursor).toBeUndefined();
    });

    it('should query commutes where user is driver or passenger', async () => {
      mockDb.commute.count.mockResolvedValue(0);
      mockDb.commute.findMany.mockResolvedValue([]);

      await call(commuteRouter.getMyCommutes, {});

      expect(mockDb.commute.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { driverId: mockUser.id },
              {
                stops: {
                  some: {
                    passengers: {
                      some: { passengerId: mockUser.id },
                    },
                  },
                },
              },
            ],
          },
        })
      );
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(call(commuteRouter.getMyCommutes, {})).rejects.toMatchObject(
        { code: 'UNAUTHORIZED' }
      );
    });
  });

  describe('update', () => {
    const updateInput = {
      id: 'commute-1',
      seats: 4,
      comment: 'Updated comment',
    };

    it('should update a commute and return it', async () => {
      mockDb.commute.findUnique.mockResolvedValue(mockCommuteFromDb);
      const updatedCommute = {
        ...mockCommuteFromDb,
        seats: 4,
        comment: 'Updated comment',
      };
      mockDb.commute.update.mockResolvedValue(updatedCommute);

      const result = await call(commuteRouter.update, updateInput);

      expect(result).toEqual(updatedCommute);
    });

    it('should throw NOT_FOUND when commute does not exist', async () => {
      mockDb.commute.findUnique.mockResolvedValue(null);

      await expect(
        call(commuteRouter.update, updateInput)
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should throw FORBIDDEN when user is not the driver', async () => {
      mockDb.commute.findUnique.mockResolvedValue({
        ...mockCommuteFromDb,
        driverId: 'other-user',
      });

      await expect(
        call(commuteRouter.update, updateInput)
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(commuteRouter.update, updateInput)
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should throw INTERNAL_SERVER_ERROR on unexpected errors', async () => {
      mockDb.commute.findUnique.mockResolvedValue(mockCommuteFromDb);
      mockDb.commute.update.mockRejectedValue(new Error('DB connection lost'));

      await expect(
        call(commuteRouter.update, updateInput)
      ).rejects.toMatchObject({ code: 'INTERNAL_SERVER_ERROR' });
    });
  });

  describe('cancel', () => {
    it('should soft-delete a commute', async () => {
      mockDb.commute.findUnique.mockResolvedValue(mockCommuteFromDb);
      mockDb.commute.delete.mockResolvedValue(mockCommuteFromDb);

      await expect(
        call(commuteRouter.cancel, { id: 'commute-1' })
      ).resolves.toBeUndefined();
    });

    it('should throw NOT_FOUND when commute does not exist', async () => {
      mockDb.commute.findUnique.mockResolvedValue(null);

      await expect(
        call(commuteRouter.cancel, { id: 'nonexistent' })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should throw FORBIDDEN when user is not the driver', async () => {
      mockDb.commute.findUnique.mockResolvedValue({
        ...mockCommuteFromDb,
        driverId: 'other-user',
      });

      await expect(
        call(commuteRouter.cancel, { id: 'commute-1' })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(commuteRouter.cancel, { id: 'commute-1' })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });
});
