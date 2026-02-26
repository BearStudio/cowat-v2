import { call } from '@orpc/server';
import { describe, expect, it } from 'vitest';

import bookingRouter from '@/server/routers/booking';
import {
  mockDb,
  mockGetSession,
  mockMemberId,
  mockOrganizationId,
} from '@/server/routers/test-utils';

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
  passengerMemberId: mockMemberId,
  stopId: 'stop-1',
};

const mockBookingWithStop = {
  ...mockBookingFromDb,
  passenger: {
    notificationPreferences: [],
    user: {
      id: 'passenger-user-1',
      name: 'Passenger',
      email: 'passenger@test.com',
    },
  },
  stop: {
    commuteId: 'commute-1',
    commute: {
      driverMemberId: mockMemberId,
      date: now,
      type: 'ROUND' as const,
      seats: 4,
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
        notificationPreferences: [],
        user: {
          id: 'driver-user-1',
          name: 'Driver',
          email: 'driver@test.com',
        },
      },
    },
  },
};

// Raw DB shape for getRequestsForDriver (passenger is a Member with nested user)
const mockBookingForDriverRaw = {
  ...mockBookingFromDb,
  passenger: {
    user: { id: 'passenger-user-1', name: 'Passenger', image: null },
  },
  stop: {
    id: 'stop-1',
    order: 0,
    outwardTime: '08:00',
    inwardTime: '18:00',
    location: { id: 'location-1', name: 'Downtown Office' },
    commute: {
      id: 'commute-1',
      date: now,
      type: 'ROUND' as const,
    },
  },
};

// Expected shape after router flattening
const mockBookingForDriverExpected = {
  ...mockBookingFromDb,
  passenger: { id: 'passenger-user-1', name: 'Passenger', image: null },
  stop: {
    id: 'stop-1',
    order: 0,
    outwardTime: '08:00',
    inwardTime: '18:00',
    location: { id: 'location-1', name: 'Downtown Office' },
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
        order: 1,
        commuteId: 'commute-1',
        commute: {
          driverMemberId: 'driver-member-1',
          type: 'ROUND',
          seats: 4,
          stops: [{ order: 0 }, { order: 1 }, { order: 2 }],
          driver: {
            organizationId: mockOrganizationId,
            autoAccept: false,
            notificationPreferences: [],
            user: {
              id: 'driver-user-1',
              name: 'Driver',
              email: 'driver@test.com',
            },
          },
        },
      });
      mockDb.passengersOnStops.findFirst.mockResolvedValue(null);
      mockDb.passengersOnStops.findMany.mockResolvedValue([]);
      mockDb.passengersOnStops.upsert.mockResolvedValue(mockBookingFromDb);

      const result = await call(bookingRouter.request, requestInput);

      expect(result).toEqual(mockBookingFromDb);
      expect(mockDb.passengersOnStops.upsert).toHaveBeenCalledWith({
        where: {
          passengerMemberId_stopId: {
            passengerMemberId: mockMemberId,
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
          passengerMemberId: mockMemberId,
        },
      });
    });

    it('should auto-accept booking when driver has autoAccept enabled', async () => {
      const autoAcceptedBooking = {
        ...mockBookingFromDb,
        status: 'ACCEPTED' as const,
      };
      mockDb.stop.findUnique.mockResolvedValue({
        order: 1,
        commuteId: 'commute-1',
        commute: {
          driverMemberId: 'driver-member-1',
          type: 'ROUND',
          seats: 4,
          stops: [{ order: 0 }, { order: 1 }, { order: 2 }],
          driver: {
            organizationId: mockOrganizationId,
            autoAccept: true,
            notificationPreferences: [],
            user: {
              id: 'driver-user-1',
              name: 'Driver',
              email: 'driver@test.com',
            },
          },
        },
      });
      mockDb.passengersOnStops.findFirst.mockResolvedValue(null);
      mockDb.passengersOnStops.findMany.mockResolvedValue([]);
      mockDb.passengersOnStops.upsert.mockResolvedValue(autoAcceptedBooking);

      const result = await call(bookingRouter.request, requestInput);

      expect(result).toEqual(autoAcceptedBooking);
      expect(mockDb.passengersOnStops.upsert).toHaveBeenCalledWith({
        where: {
          passengerMemberId_stopId: {
            passengerMemberId: mockMemberId,
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
          passengerMemberId: mockMemberId,
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

    it('should throw FORBIDDEN when the driver tries to book their own commute', async () => {
      mockDb.stop.findUnique.mockResolvedValue({
        order: 1,
        commuteId: 'commute-1',
        commute: {
          driverMemberId: mockMemberId,
          type: 'ROUND',
          seats: 4,
          stops: [{ order: 0 }, { order: 1 }, { order: 2 }],
          driver: {
            organizationId: mockOrganizationId,
            autoAccept: false,
            notificationPreferences: [],
            user: {
              id: 'driver-user-1',
              name: 'Driver',
              email: 'driver@test.com',
            },
          },
        },
      });

      await expect(
        call(bookingRouter.request, requestInput)
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('should throw CONFLICT when user already has a booking on this commute', async () => {
      mockDb.stop.findUnique.mockResolvedValue({
        order: 1,
        commuteId: 'commute-1',
        commute: {
          driverMemberId: 'driver-member-1',
          type: 'ROUND',
          seats: 4,
          stops: [{ order: 0 }, { order: 1 }, { order: 2 }],
          driver: {
            organizationId: mockOrganizationId,
            autoAccept: false,
            notificationPreferences: [],
          },
        },
      });
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

    it('should throw CONFLICT when commute outward seats are full', async () => {
      mockDb.stop.findUnique.mockResolvedValue({
        order: 1,
        commuteId: 'commute-1',
        commute: {
          driverMemberId: 'driver-member-1',
          type: 'ROUND',
          seats: 1,
          stops: [{ order: 0 }, { order: 1 }, { order: 2 }],
          driver: {
            organizationId: mockOrganizationId,
            autoAccept: false,
            notificationPreferences: [],
          },
        },
      });
      mockDb.passengersOnStops.findFirst.mockResolvedValue(null);
      mockDb.passengersOnStops.findMany.mockResolvedValue([
        { passengerMemberId: 'other-member', tripType: 'ONEWAY' },
      ]);

      await expect(
        call(bookingRouter.request, {
          ...requestInput,
          tripType: 'ONEWAY',
        })
      ).rejects.toMatchObject({
        code: 'CONFLICT',
        message: 'This commute is full',
      });
    });

    it('should throw CONFLICT when commute inward seats are full', async () => {
      mockDb.stop.findUnique.mockResolvedValue({
        order: 1,
        commuteId: 'commute-1',
        commute: {
          driverMemberId: 'driver-member-1',
          type: 'ROUND',
          seats: 1,
          stops: [{ order: 0 }, { order: 1 }, { order: 2 }],
          driver: {
            organizationId: mockOrganizationId,
            autoAccept: false,
            notificationPreferences: [],
          },
        },
      });
      mockDb.passengersOnStops.findFirst.mockResolvedValue(null);
      mockDb.passengersOnStops.findMany.mockResolvedValue([
        { passengerMemberId: 'other-member', tripType: 'RETURN' },
      ]);

      await expect(
        call(bookingRouter.request, {
          ...requestInput,
          tripType: 'RETURN',
        })
      ).rejects.toMatchObject({
        code: 'CONFLICT',
        message: 'This commute is full',
      });
    });

    it('should throw CONFLICT when commute is fully booked for ROUND trip', async () => {
      mockDb.stop.findUnique.mockResolvedValue({
        order: 1,
        commuteId: 'commute-1',
        commute: {
          driverMemberId: 'driver-member-1',
          type: 'ROUND',
          seats: 1,
          stops: [{ order: 0 }, { order: 1 }, { order: 2 }],
          driver: {
            organizationId: mockOrganizationId,
            autoAccept: false,
            notificationPreferences: [],
          },
        },
      });
      mockDb.passengersOnStops.findFirst.mockResolvedValue(null);
      mockDb.passengersOnStops.findMany.mockResolvedValue([
        { passengerMemberId: 'other-member', tripType: 'ROUND' },
      ]);

      await expect(
        call(bookingRouter.request, requestInput)
      ).rejects.toMatchObject({
        code: 'CONFLICT',
        message: 'This commute is full',
      });
    });
  });

  describe('accept', () => {
    const acceptInput = { id: 'booking-1' };

    it('should succeed for the driver', async () => {
      mockDb.passengersOnStops.findUnique.mockResolvedValue(
        mockBookingWithStop
      );
      mockDb.passengersOnStops.findMany.mockResolvedValue([]);
      mockDb.passengersOnStops.update.mockResolvedValue(undefined);

      await expect(
        call(bookingRouter.accept, acceptInput)
      ).resolves.toBeUndefined();
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
        stop: { commute: { driverMemberId: 'other-member' } },
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

    it('should throw CONFLICT when accepting would exceed seat capacity', async () => {
      mockDb.passengersOnStops.findUnique.mockResolvedValue({
        ...mockBookingWithStop,
        stop: {
          commuteId: 'commute-1',
          commute: {
            driverMemberId: mockMemberId,
            date: now,
            type: 'ROUND' as const,
            seats: 1,
          },
        },
      });
      mockDb.passengersOnStops.findMany.mockResolvedValue([
        { passengerMemberId: 'other-member', tripType: 'ROUND' },
      ]);

      await expect(
        call(bookingRouter.accept, acceptInput)
      ).rejects.toMatchObject({
        code: 'CONFLICT',
        message: 'This commute is full',
      });
    });
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
        stop: { commute: { driverMemberId: 'other-member' } },
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
        passengerMemberId: 'other-member',
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
        mockBookingForDriverRaw,
      ]);

      const result = await call(bookingRouter.getRequestsForDriver, {});

      expect(result).toEqual({
        items: [mockBookingForDriverExpected],
        nextCursor: undefined,
        total: 1,
      });
    });

    it('should filter by driverMemberId', async () => {
      mockDb.passengersOnStops.count.mockResolvedValue(1);
      mockDb.passengersOnStops.findMany.mockResolvedValue([
        mockBookingForDriverRaw,
      ]);

      await call(bookingRouter.getRequestsForDriver, {});

      expect(mockDb.passengersOnStops.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'REQUESTED',
            stop: {
              commute: {
                driverMemberId: mockMemberId,
                date: { gte: expect.any(Date) },
              },
            },
          }),
        })
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
        ...mockBookingForDriverRaw,
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

    it('should filter by driverMemberId', async () => {
      mockDb.passengersOnStops.count.mockResolvedValue(0);

      await call(bookingRouter.pendingRequestCount, undefined);

      expect(mockDb.passengersOnStops.count).toHaveBeenCalledWith({
        where: {
          status: 'REQUESTED',
          stop: {
            commute: {
              driverMemberId: mockMemberId,
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
