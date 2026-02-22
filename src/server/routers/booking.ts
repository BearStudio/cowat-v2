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
import {
  organizationProcedure,
  type OrganizationProcedureArgs,
} from '@/server/orpc';
import { createBookingRepository } from '@/server/repositories/booking.repository';
import { getDisabledChannels } from '@/server/routers/utils';

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

      const orders = stop.commute.stops.map((s) => s.order);
      const isLastStop = stop.order === Math.max(...orders);
      const allowOutward = !isLastStop;
      const allowInward = stop.commute.type === 'ROUND';

      if (
        (input.tripType === 'ONEWAY' && !allowOutward) ||
        (input.tripType === 'RETURN' && !allowInward) ||
        (input.tripType === 'ROUND' && (!allowOutward || !allowInward))
      ) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Invalid trip type for this stop',
        });
      }

      const existingBooking = await context.bookings.findExistingBooking(
        context.memberId,
        stop.commuteId
      );

      if (existingBooking) {
        throw new ORPCError('CONFLICT', {
          message: 'You already have a booking on this commute',
        });
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
      const driverUser = driverMember.user;
      const status = driverMember.autoAccept ? 'ACCEPTED' : 'REQUESTED';

      const booking = await context.bookings.upsertRequest({
        passengerMemberId: context.memberId,
        stopId: input.stopId,
        tripType: input.tripType,
        comment: input.comment,
        status,
      });

      context.notify({
        type: 'booking.requested',
        recipient: {
          userId: driverUser.id,
          name: driverUser.name,
          email: driverUser.email,
          disabledChannels: getDisabledChannels(
            driverMember.notificationPreferences
          ),
        },
        payload: {
          passengerName: context.user.name,
          commuteDate: stop.commute.date,
          tripType: input.tripType,
          status,
        },
      });

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

      const passengerUser = booking.passenger.user;
      context.notify({
        type: 'booking.accepted',
        recipient: {
          userId: passengerUser.id,
          name: passengerUser.name,
          email: passengerUser.email,
          disabledChannels: getDisabledChannels(
            booking.passenger.notificationPreferences
          ),
        },
        payload: {
          driverName: context.user.name,
          commuteDate: booking.stop.commute.date,
          tripType: booking.tripType,
        },
      });
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

      const passengerUser = booking.passenger.user;
      context.notify({
        type: 'booking.refused',
        recipient: {
          userId: passengerUser.id,
          name: passengerUser.name,
          email: passengerUser.email,
          disabledChannels: getDisabledChannels(
            booking.passenger.notificationPreferences
          ),
        },
        payload: {
          driverName: context.user.name,
          commuteDate: booking.stop.commute.date,
          tripType: booking.tripType,
        },
      });
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
      const driverUser = driverMember.user;
      context.notify({
        type: 'booking.canceled',
        recipient: {
          userId: driverUser.id,
          name: driverUser.name,
          email: driverUser.email,
          disabledChannels: getDisabledChannels(
            driverMember.notificationPreferences
          ),
        },
        payload: {
          passengerName: context.user.name,
          commuteDate: booking.stop.commute.date,
          tripType: booking.tripType,
        },
      });
    }),

  pendingRequestCount: procedure({ permissions: { booking: ['read'] } })
    .route({ method: 'GET', path: '/bookings/pending-count', tags })
    .input(z.void())
    .output(z.object({ count: z.number() }))
    .handler(async ({ context }) => {
      const count = await context.bookings.countPendingForDriver(
        context.memberId
      );
      return { count };
    }),

  getRequestsForDriver: procedure({ permissions: { booking: ['read'] } })
    .route({ method: 'GET', path: '/bookings/driver-requests', tags })
    .input(
      z
        .object({
          cursor: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(100).prefault(20),
        })
        .prefault({})
    )
    .output(
      z.object({
        items: z.array(zBookingForDriver()),
        nextCursor: z.string().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      const [total, rawItems] =
        await context.bookings.findDriverRequestsPaginated(context.memberId, {
          cursor: input.cursor,
          limit: input.limit,
        });

      let nextCursor: string | undefined;
      if (rawItems.length > input.limit) nextCursor = rawItems.pop()?.id;

      const items = rawItems.map((item) => ({
        ...item,
        passenger: item.passenger.user,
      }));

      return { items, nextCursor, total };
    }),
};
