import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import {
  zBooking,
  zBookingForDriver,
  zBookingRequest,
} from '@/features/booking/schema';
import { validateStatusTransition } from '@/features/booking/status-machine';
import {
  countPassengersByDirection,
  isTripTypeFull,
} from '@/features/commute/commute-passenger-rules';
import { toRecipient } from '@/server/notifications/utils';
import {
  organizationProcedure,
  type OrganizationProcedureArgs,
} from '@/server/orpc';
import { createBookingRepository } from '@/server/repositories/booking.repository';
import {
  paginateResult,
  zPaginatedOutput,
  zPaginationInput,
} from '@/server/routers/utils';

const tags = ['bookings'];

const procedure = (args: OrganizationProcedureArgs = {}) =>
  organizationProcedure(args).use(({ context, next }) =>
    next({ context: { bookings: createBookingRepository(context.db) } })
  );

export default {
  request: procedure({ permissions: { booking: ['request'] } })
    .route({ method: 'POST', path: '/bookings/request', tags })
    .input(zBookingRequest())
    .output(zBooking())
    .handler(async ({ context, input }) => {
      const stop = await context.bookings.findStopForRequest(input.stopId);

      if (
        !stop ||
        stop.commute.driver.organizationId !== context.organizationId
      ) {
        throw new ORPCError('NOT_FOUND');
      }

      if (stop.commute.driverMemberId === context.memberId) {
        throw new ORPCError('FORBIDDEN', {
          message: 'Drivers cannot book seats on their own commutes',
        });
      }

      const orders = stop.commute.stops.map((s) => s.order);
      const isFirstStop = stop.order === Math.min(...orders);
      const isLastStop = stop.order === Math.max(...orders);
      const allowOutward = !isLastStop;
      const allowReturn = stop.commute.type === 'ROUND' && !isFirstStop;
      const allowRound = stop.commute.type === 'ROUND' && !isLastStop;

      if (
        (input.tripType === 'ONEWAY' && !allowOutward) ||
        (input.tripType === 'RETURN' && !allowReturn) ||
        (input.tripType === 'ROUND' && !allowRound)
      ) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Invalid trip type for this stop',
        });
      }

      const activeBooking = await context.bookings.findActiveBooking(
        context.memberId,
        stop.commuteId
      );

      if (activeBooking) {
        throw new ORPCError('CONFLICT', {
          message: 'You already have a booking on this commute',
        });
      }

      const previousBooking = await context.bookings.findBookingOnStop(
        context.memberId,
        input.stopId
      );

      if (previousBooking) {
        validateStatusTransition(previousBooking.status, 'REQUESTED');
      }

      const acceptedBookings = await context.bookings.findAcceptedBookings(
        stop.commuteId
      );

      const counts = countPassengersByDirection(
        acceptedBookings.map((p) => ({
          passengerId: p.passengerMemberId,
          tripType: p.tripType,
        }))
      );

      if (isTripTypeFull(input.tripType, stop.commute.seats, counts)) {
        throw new ORPCError('CONFLICT', { message: 'This commute is full' });
      }

      const driverMember = stop.commute.driver;
      const status = driverMember.autoAccept ? 'ACCEPTED' : 'REQUESTED';

      const booking = await context.bookings.upsertRequest({
        passengerMemberId: context.memberId,
        stopId: input.stopId,
        tripType: input.tripType,
        comment: input.comment,
        status,
      });

      const sharedPayload = {
        commuteDate: stop.commute.date,
        tripType: input.tripType,
        orgSlug: context.orgSlug,
      };

      if (driverMember.autoAccept) {
        await context.notify(
          {
            type: 'booking.accepted',
            recipient: toRecipient({ user: context.user }),
            payload: {
              ...sharedPayload,
              driverName: driverMember.user.name,
            },
          },
          { db: context.db, organizationId: context.organizationId }
        );

        await context.notify(
          {
            type: 'booking.requested',
            recipient: toRecipient(driverMember),
            payload: {
              ...sharedPayload,
              passengerName: context.user.name,
              status: 'ACCEPTED',
            },
          },
          { db: context.db, organizationId: context.organizationId }
        );
      } else {
        await context.notify(
          {
            type: 'booking.requested',
            recipient: toRecipient(driverMember),
            payload: {
              ...sharedPayload,
              passengerName: context.user.name,
              status,
            },
          },
          { db: context.db, organizationId: context.organizationId }
        );
      }

      return booking;
    }),

  accept: procedure({ permissions: { booking: ['manage'] } })
    .route({ method: 'POST', path: '/bookings/{id}/accept', tags })
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      const booking = await context.bookings.findForDriverAction(input.id);

      if (!booking) {
        throw new ORPCError('NOT_FOUND');
      }

      if (booking.stop.commute.driverMemberId !== context.memberId) {
        throw new ORPCError('FORBIDDEN');
      }

      validateStatusTransition(booking.status, 'ACCEPTED');

      const acceptedBookings = await context.bookings.findAcceptedBookings(
        booking.stop.commuteId
      );

      const counts = countPassengersByDirection(
        acceptedBookings.map((p) => ({
          passengerId: p.passengerMemberId,
          tripType: p.tripType,
        }))
      );

      if (
        isTripTypeFull(booking.tripType, booking.stop.commute.seats, counts)
      ) {
        throw new ORPCError('CONFLICT', { message: 'This commute is full' });
      }

      await context.bookings.updateStatus(input.id, 'ACCEPTED');

      await context.notify(
        {
          type: 'booking.accepted',
          recipient: toRecipient(booking.passenger),
          payload: {
            driverName: context.user.name,
            commuteDate: booking.stop.commute.date,
            tripType: booking.tripType,
            orgSlug: context.orgSlug,
          },
        },
        { db: context.db, organizationId: context.organizationId }
      );
    }),

  refuse: procedure({ permissions: { booking: ['manage'] } })
    .route({ method: 'POST', path: '/bookings/{id}/refuse', tags })
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      const booking = await context.bookings.findForDriverAction(input.id);

      if (!booking) {
        throw new ORPCError('NOT_FOUND');
      }

      if (booking.stop.commute.driverMemberId !== context.memberId) {
        throw new ORPCError('FORBIDDEN');
      }

      validateStatusTransition(booking.status, 'REFUSED');

      await context.bookings.updateStatus(input.id, 'REFUSED');

      await context.notify(
        {
          type: 'booking.refused',
          recipient: toRecipient(booking.passenger),
          payload: {
            driverName: context.user.name,
            commuteDate: booking.stop.commute.date,
            tripType: booking.tripType,
            orgSlug: context.orgSlug,
          },
        },
        { db: context.db, organizationId: context.organizationId }
      );
    }),

  cancel: procedure({ permissions: { booking: ['manage'] } })
    .route({ method: 'POST', path: '/bookings/{id}/cancel', tags })
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      const booking = await context.bookings.findForPassengerCancel(input.id);

      if (!booking) {
        throw new ORPCError('NOT_FOUND');
      }

      if (booking.passengerMemberId !== context.memberId) {
        throw new ORPCError('FORBIDDEN');
      }

      validateStatusTransition(booking.status, 'CANCELED');

      await context.bookings.updateStatus(input.id, 'CANCELED');

      const driverMember = booking.stop.commute.driver;
      await context.notify(
        {
          type: 'booking.canceled',
          recipient: toRecipient(driverMember),
          payload: {
            passengerName: context.user.name,
            commuteDate: booking.stop.commute.date,
            tripType: booking.tripType,
            orgSlug: context.orgSlug,
          },
        },
        { db: context.db, organizationId: context.organizationId }
      );
    }),

  pendingRequestCount: procedure({ permissions: { booking: ['read'] } })
    .route({ method: 'GET', path: '/bookings/pending-count', tags })
    .input(z.object({}).prefault({}))
    .output(z.object({ count: z.number() }))
    .handler(async ({ context }) => {
      const count = await context.bookings.countPendingForDriver(
        context.memberId
      );
      return { count };
    }),

  getRequestsForDriver: procedure({ permissions: { booking: ['read'] } })
    .route({ method: 'GET', path: '/bookings/driver-requests', tags })
    .input(zPaginationInput.prefault({}))
    .output(zPaginatedOutput(zBookingForDriver()))
    .handler(async ({ context, input }) => {
      const [total, items] = await context.bookings.findDriverRequestsPaginated(
        context.memberId,
        {
          cursor: input.cursor,
          limit: input.limit,
        }
      );

      return paginateResult(total, items, input.limit, (item) => ({
        ...item,
        passenger: item.passenger.user,
      }));
    }),
};
