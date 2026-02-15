import { call } from '@orpc/server';
import { describe, expect, it } from 'vitest';

import bookingRouter from '@/server/routers/booking';
import { mockDb, mockGetSession, mockUser } from '@/server/routers/test-utils';

const now = new Date();

const mockBookingFromDb = {
  id: 'booking-1',
  status: 'REQUESTED' as const,
  stopStatus: 'UNKNOWN' as const,
  tripType: 'ROUND' as const,
  delay: null,
  comment: null,
  isDeleted: false,
  createdAt: now,
  updatedAt: now,
  passengerId: mockUser.id,
  stopId: 'stop-1',
};

const mockBookingWithStop = {
  ...mockBookingFromDb,
  passenger: {
    id: 'passenger-1',
    name: 'Passenger',
    email: 'passenger@test.com',
    notificationPreferences: [],
  },
  stop: {
    commute: {
      driverId: mockUser.id,
      date: now,
      type: 'ROUND' as const,
    },
  },
};

const mockBookingWithDriver = {
  ...mockBookingFromDb,
  stop: {
    commute: {
      date: now,
      type: 'ROUND' as const,
      driver: {
        id: 'driver-1',
        name: 'Driver',
        email: 'driver@test.com',
        notificationPreferences: [],
      },
    },
  },
};

const mockBookingForDriver = {
  ...mockBookingFromDb,
  passenger: { id: 'passenger-1', name: 'Passenger', image: null },
  stop: {
    id: 'stop-1',
    order: 0,
    outwardTime: '08:00',
    inwardTime: '18:00',
    commute: {
      id: 'commute-1',
      date: now,
      type: 'ROUND' as const,
    },
  },
};

describe('booking router', () => {
  describe('request', () => {
    const requestInput = {
      stopId: 'stop-1',
      tripType: 'ROUND' as const,
      comment: 'Pick me up please',
    };

    it('should create a REQUESTED booking when driver has autoAccept disabled', async () => {
      mockDb.stop.findUnique.mockResolvedValue({
        commuteId: 'commute-1',
        commute: { driver: { autoAccept: false, notificationPreferences: [] } },
      });
      mockDb.passengersOnStops.findFirst.mockResolvedValue(null);
      mockDb.passengersOnStops.upsert.mockResolvedValue(mockBookingFromDb);

      const result = await call(bookingRouter.request, requestInput);

      expect(result).toEqual(mockBookingFromDb);
      expect(mockDb.passengersOnStops.upsert).toHaveBeenCalledWith({
        where: {
          passengerId_stopId: {
            passengerId: mockUser.id,
            stopId: requestInput.stopId,
          },
        },
        update: {
          status: 'REQUESTED',
          tripType: requestInput.tripType,
          comment: requestInput.comment,
        },
        create: {
          ...requestInput,
          status: 'REQUESTED',
          passengerId: mockUser.id,
        },
      });
    });

    it('should auto-accept booking when driver has autoAccept enabled', async () => {
      const autoAcceptedBooking = {
        ...mockBookingFromDb,
        status: 'ACCEPTED' as const,
      };
      mockDb.stop.findUnique.mockResolvedValue({
        commuteId: 'commute-1',
        commute: { driver: { autoAccept: true, notificationPreferences: [] } },
      });
      mockDb.passengersOnStops.findFirst.mockResolvedValue(null);
      mockDb.passengersOnStops.upsert.mockResolvedValue(autoAcceptedBooking);

      const result = await call(bookingRouter.request, requestInput);

      expect(result).toEqual(autoAcceptedBooking);
      expect(mockDb.passengersOnStops.upsert).toHaveBeenCalledWith({
        where: {
          passengerId_stopId: {
            passengerId: mockUser.id,
            stopId: requestInput.stopId,
          },
        },
        update: {
          status: 'ACCEPTED',
          tripType: requestInput.tripType,
          comment: requestInput.comment,
        },
        create: {
          ...requestInput,
          status: 'ACCEPTED',
          passengerId: mockUser.id,
        },
      });
    });

    it('should throw NOT_FOUND when stop does not exist', async () => {
      mockDb.stop.findUnique.mockResolvedValue(null);

      await expect(
        call(bookingRouter.request, requestInput)
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should throw CONFLICT when user already has a booking on this commute', async () => {
      mockDb.stop.findUnique.mockResolvedValue({ commuteId: 'commute-1' });
      mockDb.passengersOnStops.findFirst.mockResolvedValue(mockBookingFromDb);

      await expect(
        call(bookingRouter.request, requestInput)
      ).rejects.toMatchObject({
        code: 'CONFLICT',
      });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(bookingRouter.request, requestInput)
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('accept', () => {
    const acceptInput = { id: 'booking-1' };

    it('should succeed for the driver', async () => {
      mockDb.passengersOnStops.findUnique.mockResolvedValue(
        mockBookingWithStop
      );
      mockDb.passengersOnStops.update.mockResolvedValue(undefined);

      await expect(
        call(bookingRouter.accept, acceptInput)
      ).resolves.toBeUndefined();

      expect(mockDb.passengersOnStops.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: { status: 'ACCEPTED' },
      });
    });

    it('should throw NOT_FOUND when booking does not exist', async () => {
      mockDb.passengersOnStops.findUnique.mockResolvedValue(null);

      await expect(
        call(bookingRouter.accept, acceptInput)
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should throw FORBIDDEN when user is not the driver', async () => {
      mockDb.passengersOnStops.findUnique.mockResolvedValue({
        ...mockBookingWithStop,
        stop: { commute: { driverId: 'other-user' } },
      });

      await expect(
        call(bookingRouter.accept, acceptInput)
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(bookingRouter.accept, acceptInput)
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it.each(['ACCEPTED', 'REFUSED', 'CANCELED'] as const)(
      'should throw BAD_REQUEST when booking status is %s',
      async (status) => {
        mockDb.passengersOnStops.findUnique.mockResolvedValue({
          ...mockBookingWithStop,
          status,
        });

        await expect(
          call(bookingRouter.accept, acceptInput)
        ).rejects.toMatchObject({
          code: 'BAD_REQUEST',
        });
      }
    );
  });

  describe('refuse', () => {
    const refuseInput = { id: 'booking-1' };

    it('should succeed for the driver', async () => {
      mockDb.passengersOnStops.findUnique.mockResolvedValue(
        mockBookingWithStop
      );
      mockDb.passengersOnStops.update.mockResolvedValue(undefined);

      await expect(
        call(bookingRouter.refuse, refuseInput)
      ).resolves.toBeUndefined();

      expect(mockDb.passengersOnStops.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: { status: 'REFUSED' },
      });
    });

    it('should throw NOT_FOUND when booking does not exist', async () => {
      mockDb.passengersOnStops.findUnique.mockResolvedValue(null);

      await expect(
        call(bookingRouter.refuse, refuseInput)
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should throw FORBIDDEN when user is not the driver', async () => {
      mockDb.passengersOnStops.findUnique.mockResolvedValue({
        ...mockBookingWithStop,
        stop: { commute: { driverId: 'other-user' } },
      });

      await expect(
        call(bookingRouter.refuse, refuseInput)
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(bookingRouter.refuse, refuseInput)
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it.each(['ACCEPTED', 'REFUSED', 'CANCELED'] as const)(
      'should throw BAD_REQUEST when booking status is %s',
      async (status) => {
        mockDb.passengersOnStops.findUnique.mockResolvedValue({
          ...mockBookingWithStop,
          status,
        });

        await expect(
          call(bookingRouter.refuse, refuseInput)
        ).rejects.toMatchObject({
          code: 'BAD_REQUEST',
        });
      }
    );
  });

  describe('cancel', () => {
    const cancelInput = { id: 'booking-1' };

    it('should succeed for the passenger', async () => {
      mockDb.passengersOnStops.findUnique.mockResolvedValue(
        mockBookingWithDriver
      );
      mockDb.passengersOnStops.update.mockResolvedValue(undefined);

      await expect(
        call(bookingRouter.cancel, cancelInput)
      ).resolves.toBeUndefined();

      expect(mockDb.passengersOnStops.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: { status: 'CANCELED' },
      });
    });

    it('should throw NOT_FOUND when booking does not exist', async () => {
      mockDb.passengersOnStops.findUnique.mockResolvedValue(null);

      await expect(
        call(bookingRouter.cancel, cancelInput)
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should throw FORBIDDEN when user is not the passenger', async () => {
      mockDb.passengersOnStops.findUnique.mockResolvedValue({
        ...mockBookingWithDriver,
        passengerId: 'other-user',
      });

      await expect(
        call(bookingRouter.cancel, cancelInput)
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('should succeed when booking status is ACCEPTED', async () => {
      mockDb.passengersOnStops.findUnique.mockResolvedValue({
        ...mockBookingWithDriver,
        status: 'ACCEPTED',
      });
      mockDb.passengersOnStops.update.mockResolvedValue(undefined);

      await expect(
        call(bookingRouter.cancel, cancelInput)
      ).resolves.toBeUndefined();
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(bookingRouter.cancel, cancelInput)
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it.each(['REFUSED', 'CANCELED'] as const)(
      'should throw BAD_REQUEST when booking status is %s',
      async (status) => {
        mockDb.passengersOnStops.findUnique.mockResolvedValue({
          ...mockBookingWithDriver,
          status,
        });

        await expect(
          call(bookingRouter.cancel, cancelInput)
        ).rejects.toMatchObject({
          code: 'BAD_REQUEST',
        });
      }
    );
  });

  describe('getRequestsForDriver', () => {
    it('should return paginated booking requests for the driver', async () => {
      mockDb.passengersOnStops.count.mockResolvedValue(1);
      mockDb.passengersOnStops.findMany.mockResolvedValue([
        mockBookingForDriver,
      ]);

      const result = await call(bookingRouter.getRequestsForDriver, {});

      expect(result).toEqual({
        items: [mockBookingForDriver],
        nextCursor: undefined,
        total: 1,
      });
    });

    it('should filter out requests for past dates', async () => {
      mockDb.passengersOnStops.count.mockResolvedValue(1);
      mockDb.passengersOnStops.findMany.mockResolvedValue([
        mockBookingForDriver,
      ]);

      await call(bookingRouter.getRequestsForDriver, {});

      const expectedWhere = expect.objectContaining({
        status: 'REQUESTED',
        stop: {
          commute: {
            driverId: mockUser.id,
            date: { gte: expect.any(Date) },
          },
        },
      });
      expect(mockDb.passengersOnStops.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(mockDb.passengersOnStops.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expectedWhere })
      );
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(bookingRouter.getRequestsForDriver, {})
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should handle pagination with cursor', async () => {
      const bookings = Array.from({ length: 3 }, (_, i) => ({
        ...mockBookingForDriver,
        id: `booking-${i}`,
      }));
      mockDb.passengersOnStops.count.mockResolvedValue(5);
      mockDb.passengersOnStops.findMany.mockResolvedValue(bookings);

      const result = await call(bookingRouter.getRequestsForDriver, {
        limit: 2,
      });

      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toBe('booking-2');
      expect(result.total).toBe(5);
    });
  });

  describe('pendingRequestCount', () => {
    it('should return the count of pending requests', async () => {
      mockDb.passengersOnStops.count.mockResolvedValue(3);

      const result = await call(bookingRouter.pendingRequestCount, undefined);

      expect(result).toEqual({ count: 3 });
    });

    it('should filter out requests for past dates', async () => {
      mockDb.passengersOnStops.count.mockResolvedValue(0);

      await call(bookingRouter.pendingRequestCount, undefined);

      expect(mockDb.passengersOnStops.count).toHaveBeenCalledWith({
        where: {
          status: 'REQUESTED',
          stop: {
            commute: {
              driverId: mockUser.id,
              date: { gte: expect.any(Date) },
            },
          },
        },
      });
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(bookingRouter.pendingRequestCount, undefined)
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });
});
