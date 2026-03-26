import type { AppDB } from '@/server/db';
import type { RequestStatus, TripType } from '@/server/db/generated/client';

const passengerWithNotifications = {
  include: {
    notificationPreferences: {
      where: { enabled: false },
      select: { channel: true },
    },
    user: { select: { id: true, name: true, email: true } },
  },
} as const;

const affectedPassengersInclude = {
  passenger: passengerWithNotifications,
} as const;

const bookingWithPassengerAndCommuteInclude = {
  passenger: passengerWithNotifications,
  stop: { include: { commute: true } },
} as const;

export const createBookingRepository = (db: AppDB) => ({
  findStopForRequest: (stopId: string) =>
    db.stop.findUnique({
      where: { id: stopId },
      select: {
        order: true,
        commuteId: true,
        commute: {
          select: {
            driverMemberId: true,
            date: true,
            type: true,
            seats: true,
            stops: { select: { order: true } },
            driver: {
              select: {
                organizationId: true,
                autoAccept: true,
                notificationPreferences: {
                  where: { enabled: false },
                  select: { channel: true },
                },
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    }),

  findActiveBooking: (passengerMemberId: string, commuteId: string) =>
    db.passengersOnStops.findFirst({
      where: {
        passengerMemberId,
        status: { in: ['REQUESTED', 'ACCEPTED'] },
        stop: { commuteId },
      },
    }),

  findBookingOnStop: (passengerMemberId: string, stopId: string) =>
    db.passengersOnStops.findUnique({
      where: {
        passengerMemberId_stopId: { passengerMemberId, stopId },
      },
    }),

  findAcceptedBookings: (commuteId: string) =>
    db.passengersOnStops.findMany({
      where: { status: 'ACCEPTED', stop: { commuteId } },
      select: { passengerMemberId: true, tripType: true },
    }),

  upsertRequest: (params: {
    passengerMemberId: string;
    stopId: string;
    tripType: TripType;
    comment?: string | null;
    status: RequestStatus;
  }) =>
    db.passengersOnStops.upsert({
      where: {
        passengerMemberId_stopId: {
          passengerMemberId: params.passengerMemberId,
          stopId: params.stopId,
        },
      },
      update: {
        status: params.status,
        tripType: params.tripType,
        comment: params.comment,
      },
      create: {
        passengerMemberId: params.passengerMemberId,
        stopId: params.stopId,
        tripType: params.tripType,
        comment: params.comment,
        status: params.status,
      },
    }),

  findForDriverAction: (bookingId: string) =>
    db.passengersOnStops.findUnique({
      where: { id: bookingId },
      include: bookingWithPassengerAndCommuteInclude,
    }),

  updateStatus: (id: string, status: RequestStatus) =>
    db.passengersOnStops.update({ where: { id }, data: { status } }),

  findForPassengerCancel: (bookingId: string) =>
    db.passengersOnStops.findUnique({
      where: { id: bookingId },
      include: {
        stop: {
          include: {
            commute: {
              include: {
                driver: {
                  include: {
                    notificationPreferences: {
                      where: { enabled: false },
                      select: { channel: true },
                    },
                    user: { select: { id: true, name: true, email: true } },
                  },
                },
              },
            },
          },
        },
      },
    }),

  countPendingForDriver: (memberId: string) =>
    db.passengersOnStops.count({
      where: {
        status: 'REQUESTED',
        stop: {
          commute: { driverMemberId: memberId, date: { gte: new Date() } },
        },
      },
    }),

  findAffectedPassengers: (commuteId: string) =>
    db.passengersOnStops.findMany({
      where: {
        stop: { commuteId },
        status: { in: ['REQUESTED', 'ACCEPTED'] as RequestStatus[] },
      },
      include: affectedPassengersInclude,
    }),

  findDriverRequestsPaginated: (
    memberId: string,
    opts: { cursor?: string; limit: number }
  ) => {
    const where = {
      status: 'REQUESTED' as const,
      stop: {
        commute: { driverMemberId: memberId, date: { gte: new Date() } },
      },
    };

    return Promise.all([
      db.passengersOnStops.count({ where }),
      db.passengersOnStops.findMany({
        take: opts.limit + 1,
        cursor: opts.cursor ? { id: opts.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        where,
        include: {
          passenger: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
          },
          stop: {
            select: {
              id: true,
              order: true,
              outwardTime: true,
              inwardTime: true,
              location: { select: { id: true, name: true, address: true } },
              commute: { select: { id: true, date: true, type: true } },
            },
          },
        },
      }),
    ]);
  },
});
