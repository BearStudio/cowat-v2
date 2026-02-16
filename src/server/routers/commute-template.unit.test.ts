import { call } from '@orpc/server';
import { describe, expect, it } from 'vitest';

import commuteTemplateRouter from '@/server/routers/commute-template';
import {
  mockDb,
  mockGetSession,
  mockMemberId,
  mockOrganizationId,
  mockUser,
} from '@/server/routers/test-utils';

const now = new Date();

const mockTemplateFromDb = {
  id: 'template-1',
  name: 'Morning commute',
  seats: 3,
  type: 'ROUND' as const,
  comment: null,
  isDeleted: false,
  createdAt: now,
  updatedAt: now,
  driverMemberId: mockMemberId,
};

const mockStop = {
  id: 'stop-1',
  order: 0,
  outwardTime: '08:00',
  inwardTime: '18:00',
  templateId: 'template-1',
  locationId: 'location-1',
  createdAt: now,
  updatedAt: now,
};

const mockStopWithLocation = {
  ...mockStop,
  location: { id: 'location-1', name: 'Office' },
};

describe('commute-template router', () => {
  describe('create', () => {
    const createInput = {
      name: 'Morning commute',
      seats: 3,
      type: 'ROUND' as const,
      comment: null,
      stops: [
        {
          locationId: 'location-1',
          order: 0,
          outwardTime: '08:00',
          inwardTime: '18:00',
        },
      ],
    };

    it('should create a template with stops', async () => {
      mockDb.commuteTemplate.create.mockResolvedValue({
        ...mockTemplateFromDb,
        stops: [mockStop],
      });

      const result = await call(commuteTemplateRouter.create, createInput);

      expect(result).toEqual({ ...mockTemplateFromDb, stops: [mockStop] });
      expect(mockDb.commuteTemplate.create).toHaveBeenCalledWith({
        data: {
          name: createInput.name,
          seats: createInput.seats,
          type: createInput.type,
          comment: createInput.comment,
          driverMemberId: mockMemberId,
          stops: {
            create: createInput.stops,
          },
        },
        include: { stops: true },
      });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(commuteTemplateRouter.create, createInput)
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('getAll', () => {
    const mockTemplateWithStops = {
      ...mockTemplateFromDb,
      stops: [mockStopWithLocation],
    };

    it('should return paginated templates for the driver', async () => {
      mockDb.commuteTemplate.count.mockResolvedValue(1);
      mockDb.commuteTemplate.findMany.mockResolvedValue([
        mockTemplateWithStops,
      ]);

      const result = await call(commuteTemplateRouter.getAll, {});

      expect(result).toEqual({
        items: [mockTemplateWithStops],
        nextCursor: undefined,
        total: 1,
      });
    });

    it('should handle pagination with cursor', async () => {
      const templates = Array.from({ length: 3 }, (_, i) => ({
        ...mockTemplateWithStops,
        id: `template-${i}`,
      }));
      mockDb.commuteTemplate.count.mockResolvedValue(5);
      mockDb.commuteTemplate.findMany.mockResolvedValue(templates);

      const result = await call(commuteTemplateRouter.getAll, { limit: 2 });

      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toBe('template-2');
      expect(result.total).toBe(5);
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(commuteTemplateRouter.getAll, {})
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('getById', () => {
    it('should return a template with stops and locations', async () => {
      mockDb.commuteTemplate.findFirst.mockResolvedValue({
        ...mockTemplateFromDb,
        stops: [mockStopWithLocation],
      });

      const result = await call(commuteTemplateRouter.getById, {
        id: 'template-1',
      });

      expect(result).toEqual({
        ...mockTemplateFromDb,
        stops: [mockStopWithLocation],
      });
    });

    it('should throw NOT_FOUND when template does not exist', async () => {
      mockDb.commuteTemplate.findFirst.mockResolvedValue(null);

      await expect(
        call(commuteTemplateRouter.getById, { id: 'nonexistent' })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(commuteTemplateRouter.getById, { id: 'template-1' })
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('update', () => {
    const updateInput = {
      id: 'template-1',
      name: 'Updated commute',
      stops: [
        {
          locationId: 'location-2',
          order: 0,
          outwardTime: '09:00',
          inwardTime: '17:00',
        },
      ],
    };

    it('should update template fields and replace stops', async () => {
      mockDb.commuteTemplate.findFirst.mockResolvedValue(mockTemplateFromDb);
      mockDb.commuteTemplate.update.mockResolvedValue({
        ...mockTemplateFromDb,
        name: 'Updated commute',
        stops: [{ ...mockStop, locationId: 'location-2' }],
      });

      const result = await call(commuteTemplateRouter.update, updateInput);

      expect(result.name).toBe('Updated commute');
      expect(mockDb.commuteTemplate.update).toHaveBeenCalledWith({
        where: { id: 'template-1' },
        data: {
          name: 'Updated commute',
          stops: {
            deleteMany: {},
            create: updateInput.stops,
          },
        },
        include: { stops: true },
      });
    });

    it('should update without replacing stops when stops not provided', async () => {
      mockDb.commuteTemplate.findFirst.mockResolvedValue(mockTemplateFromDb);
      mockDb.commuteTemplate.update.mockResolvedValue({
        ...mockTemplateFromDb,
        name: 'Updated commute',
        stops: [mockStop],
      });

      await call(commuteTemplateRouter.update, {
        id: 'template-1',
        name: 'Updated commute',
      });

      expect(mockDb.commuteTemplate.update).toHaveBeenCalledWith({
        where: { id: 'template-1' },
        data: { name: 'Updated commute' },
        include: { stops: true },
      });
    });

    it('should throw NOT_FOUND when template does not exist', async () => {
      mockDb.commuteTemplate.findFirst.mockResolvedValue(null);

      await expect(
        call(commuteTemplateRouter.update, updateInput)
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should throw FORBIDDEN when user is not the owner', async () => {
      mockDb.commuteTemplate.findFirst.mockResolvedValue({
        ...mockTemplateFromDb,
        driverMemberId: 'other-member',
      });

      await expect(
        call(commuteTemplateRouter.update, updateInput)
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(commuteTemplateRouter.update, updateInput)
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('delete', () => {
    const deleteInput = { id: 'template-1' };

    it('should soft-delete the template', async () => {
      mockDb.commuteTemplate.findFirst.mockResolvedValue(mockTemplateFromDb);
      mockDb.commuteTemplate.delete.mockResolvedValue(undefined);

      await expect(
        call(commuteTemplateRouter.delete, deleteInput)
      ).resolves.toBeUndefined();

      expect(mockDb.commuteTemplate.delete).toHaveBeenCalledWith({
        where: { id: 'template-1' },
      });
    });

    it('should throw NOT_FOUND when template does not exist', async () => {
      mockDb.commuteTemplate.findFirst.mockResolvedValue(null);

      await expect(
        call(commuteTemplateRouter.delete, deleteInput)
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should throw FORBIDDEN when user is not the owner', async () => {
      mockDb.commuteTemplate.findFirst.mockResolvedValue({
        ...mockTemplateFromDb,
        driverMemberId: 'other-member',
      });

      await expect(
        call(commuteTemplateRouter.delete, deleteInput)
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(commuteTemplateRouter.delete, deleteInput)
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });
});
