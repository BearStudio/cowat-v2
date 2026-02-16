import { call } from '@orpc/server';
import { describe, expect, it } from 'vitest';

import locationRouter from '@/server/routers/location';
import {
  mockDb,
  mockGetSession,
  mockMemberId,
  mockUserHasPermission,
} from '@/server/routers/test-utils';

const now = new Date();

const mockLocationFromDb = {
  id: 'location-1',
  name: 'Home',
  address: '123 Main St',
  latitude: 48.8566,
  longitude: 2.3522,
  isDeleted: false,
  createdAt: now,
  updatedAt: now,
  memberId: mockMemberId,
};

describe('location router', () => {
  describe('create', () => {
    const createInput = {
      name: 'Office',
      address: '456 Work Ave',
    };

    it('should succeed for an authenticated user', async () => {
      const created = { ...mockLocationFromDb, ...createInput, id: 'loc-new' };
      mockDb.location.create.mockResolvedValue(created);

      const result = await call(locationRouter.create, createInput);

      expect(result).toEqual(created);
    });

    it('should not require any specific permission', async () => {
      mockDb.location.create.mockResolvedValue({
        ...mockLocationFromDb,
        ...createInput,
      });

      await call(locationRouter.create, createInput);

      expect(mockUserHasPermission).not.toHaveBeenCalled();
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(locationRouter.create, createInput)
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('getAll', () => {
    it('should return paginated locations with total count', async () => {
      mockDb.location.count.mockResolvedValue(1);
      mockDb.location.findMany.mockResolvedValue([mockLocationFromDb]);

      const result = await call(locationRouter.getAll, {});

      expect(result).toEqual({
        items: [mockLocationFromDb],
        nextCursor: undefined,
        total: 1,
      });
    });

    it('should return nextCursor when there are more items than limit', async () => {
      const locations = Array.from({ length: 4 }, (_, i) => ({
        ...mockLocationFromDb,
        id: `location-${i + 1}`,
      }));
      mockDb.location.count.mockResolvedValue(10);
      mockDb.location.findMany.mockResolvedValue(locations);

      const result = await call(locationRouter.getAll, { limit: 3 });

      expect(result.items).toHaveLength(3);
      expect(result.nextCursor).toBe('location-4');
      expect(result.total).toBe(10);
    });

    it('should not return nextCursor when items fit within limit', async () => {
      mockDb.location.count.mockResolvedValue(1);
      mockDb.location.findMany.mockResolvedValue([mockLocationFromDb]);

      const result = await call(locationRouter.getAll, { limit: 5 });

      expect(result.nextCursor).toBeUndefined();
    });

    it('should not require any specific permission', async () => {
      mockDb.location.count.mockResolvedValue(0);
      mockDb.location.findMany.mockResolvedValue([]);

      await call(locationRouter.getAll, {});

      expect(mockUserHasPermission).not.toHaveBeenCalled();
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(call(locationRouter.getAll, {})).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('getById', () => {
    it('should return a location when found', async () => {
      mockDb.location.findFirst.mockResolvedValue(mockLocationFromDb);

      const result = await call(locationRouter.getById, { id: 'location-1' });

      expect(result).toEqual(mockLocationFromDb);
    });

    it('should throw NOT_FOUND when location does not exist', async () => {
      mockDb.location.findFirst.mockResolvedValue(null);

      await expect(
        call(locationRouter.getById, { id: 'nonexistent' })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should not require any specific permission', async () => {
      mockDb.location.findFirst.mockResolvedValue(mockLocationFromDb);

      await call(locationRouter.getById, { id: 'location-1' });

      expect(mockUserHasPermission).not.toHaveBeenCalled();
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(locationRouter.getById, { id: 'location-1' })
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('update', () => {
    const updateInput = {
      id: 'location-1',
      name: 'Updated Home',
      address: '789 New St',
    };

    it('should update a location and return it', async () => {
      const updated = { ...mockLocationFromDb, ...updateInput };
      mockDb.location.findFirst.mockResolvedValue(mockLocationFromDb);
      mockDb.location.update.mockResolvedValue(updated);

      const result = await call(locationRouter.update, updateInput);

      expect(result).toEqual(updated);
    });

    it('should throw NOT_FOUND when location does not exist', async () => {
      mockDb.location.findFirst.mockResolvedValue(null);

      await expect(
        call(locationRouter.update, updateInput)
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should not require any specific permission', async () => {
      mockDb.location.findFirst.mockResolvedValue(mockLocationFromDb);
      mockDb.location.update.mockResolvedValue({
        ...mockLocationFromDb,
        ...updateInput,
      });

      await call(locationRouter.update, updateInput);

      expect(mockUserHasPermission).not.toHaveBeenCalled();
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(locationRouter.update, updateInput)
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('delete', () => {
    it('should soft-delete a location', async () => {
      mockDb.location.findFirst.mockResolvedValue(mockLocationFromDb);
      mockDb.location.delete.mockResolvedValue({
        ...mockLocationFromDb,
        isDeleted: true,
      });

      await expect(
        call(locationRouter.delete, { id: 'location-1' })
      ).resolves.toBeUndefined();
    });

    it('should throw NOT_FOUND when location does not exist', async () => {
      mockDb.location.findFirst.mockResolvedValue(null);

      await expect(
        call(locationRouter.delete, { id: 'nonexistent' })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should not require any specific permission', async () => {
      mockDb.location.findFirst.mockResolvedValue(mockLocationFromDb);
      mockDb.location.delete.mockResolvedValue({
        ...mockLocationFromDb,
        isDeleted: true,
      });

      await call(locationRouter.delete, { id: 'location-1' });

      expect(mockUserHasPermission).not.toHaveBeenCalled();
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(locationRouter.delete, { id: 'location-1' })
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });
});
