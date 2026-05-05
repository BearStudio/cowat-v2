import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import { getTodayMidnight } from '@/lib/date';

import {
  zCommute,
  zCommuteEnriched,
  zCommuteType,
  zStop,
  zStopInput,
} from '@/features/commute/schema';
import { toRecipient } from '@/server/notifications/utils';
import {
  organizationProcedure,
  type OrganizationProcedureArgs,
} from '@/server/orpc';
import { createBookingRepository } from '@/server/repositories/booking.repository';
import { createCommuteRepository } from '@/server/repositories/commute.repository';
import { createCommuteRequestRepository } from '@/server/repositories/commute-request.repository';
import {
  assertDriverOwnership,
  paginateResult,
  zPaginatedOutput,
  zPaginationInput,
} from '@/server/routers/utils';

const tags = ['commutes'];

const procedure = (args: OrganizationProcedureArgs = {}) =>
  organizationProcedure(args).use(({ context, next }) =>
    next({
      context: {
        commutes: createCommuteRepository(context.db),
        bookings: createBookingRepository(context.db),
        commuteRequests: createCommuteRequestRepository(context.db),
      },
    })
  );

export default {
  create: procedure({ permissions: { commute: ['create'] } })
    .route({ method: 'POST', path: '/commutes', tags })
    .input(
      z.object({
        date: z.date(),
        seats: z.number().int().min(1),
        type: zCommuteType(),
        comment: z.string().nullish(),
        stops: z.array(zStopInput()).min(1),
        commuteRequestIds: z.array(z.string()).nullish(),
      })
    )
    .output(zCommute().extend({ stops: z.array(zStop()) }))
    .handler(async ({ context, input }) => {
      const { stops, commuteRequestIds, ...commuteData } = input;
      const commute = await context.commutes.create({
        ...commuteData,
        driverMemberId: context.memberId,
        stops: { create: stops },
      });

      if (commuteRequestIds?.length) {
        await context.commuteRequests.fulfillMany(
          commuteRequestIds,
          commute.id,
          context.organizationId
        );
      }

      await context.notify(
        {
          type: 'commute.created',
          payload: {
            commuteId: commute.id,
            driverName: context.user.name,
            driverEmail: context.user.email,
            commuteDate: input.date,
            commuteType: input.type,
            seats: input.seats,
            stops: commute.stops.map((stop) => ({
              stopId: stop.id,
              locationName: stop.location.name,
              locationAddress: stop.location.address,
              outwardTime: stop.outwardTime,
              inwardTime: stop.inwardTime,
            })),
            orgSlug: context.orgSlug,
          },
        },
        { db: context.db, organizationId: context.organizationId }
      );

      return commute;
    }),

  getById: procedure({ permissions: { commute: ['read'] } })
    .route({ method: 'GET', path: '/commutes/{id}', tags })
    .input(z.object({ id: z.string() }))
    .output(zCommute().extend({ stops: z.array(zStop()) }))
    .handler(async ({ context, input }) => {
      const commute = await context.commutes.findById(
        input.id,
        context.organizationId
      );

      if (!commute) {
        throw new ORPCError('NOT_FOUND');
      }

      return commute;
    }),

  getByDate: procedure({ permissions: { commute: ['read'] } })
    .route({ method: 'GET', path: '/commutes/by-date', tags })
    .input(z.object({ from: z.date(), to: z.date() }))
    .output(z.array(zCommuteEnriched()))
    .handler(async ({ context, input }) => {
      return context.commutes.findByDateRange({
        from: input.from,
        to: input.to,
        organizationId: context.organizationId,
      });
    }),

  getMyCommutes: procedure({ permissions: { commute: ['read'] } })
    .route({ method: 'GET', path: '/commutes/mine', tags })
    .input(zPaginationInput.prefault({}))
    .output(zPaginatedOutput(zCommuteEnriched()))
    .handler(async ({ context, input }) => {
      const { total, items } = await context.commutes.findMyPaginated({
        memberId: context.memberId,
        organizationId: context.organizationId,
        fromDate: getTodayMidnight(),
        cursor: input.cursor,
        limit: input.limit,
      });

      return paginateResult(total, items, input.limit);
    }),

  getByIdEnriched: procedure({ permissions: { commute: ['read'] } })
    .route({ method: 'GET', path: '/commutes/{id}/enriched', tags })
    .input(z.object({ id: z.string() }))
    .output(zCommuteEnriched())
    .handler(async ({ context, input }) => {
      const commute = await context.commutes.findByIdEnriched(
        input.id,
        context.organizationId
      );

      if (!commute) {
        throw new ORPCError('NOT_FOUND');
      }

      return commute;
    }),

  update: procedure({ permissions: { commute: ['update'] } })
    .route({ method: 'POST', path: '/commutes/{id}', tags })
    .input(
      z.object({
        id: z.string(),
        seats: z.number().int().min(1).optional(),
        type: zCommuteType().optional(),
        comment: z.string().nullish(),
        stops: z.array(zStopInput()).min(1).optional(),
      })
    )
    .output(zCommute().extend({ stops: z.array(zStop()) }))
    .handler(async ({ context, input }) => {
      const existing = await context.commutes.findForMutation(
        input.id,
        context.organizationId
      );
      assertDriverOwnership(existing, context.memberId);

      const { id, stops, ...data } = input;

      const affectedPassengers =
        await context.bookings.findAffectedPassengers(id);

      // Cancel all bookings when seats are reduced below current passenger count
      const newSeats = data.seats ?? existing.seats;
      const seatsReduced = newSeats < affectedPassengers.length;

      if (seatsReduced) {
        await context.bookings.cancelMany(affectedPassengers.map((b) => b.id));
      }

      const commute = await context.commutes.update(id, {
        ...data,
        ...(stops && { stops }),
      });

      const orgContext = {
        db: context.db,
        organizationId: context.organizationId,
      };

      for (const booking of affectedPassengers) {
        const recipient = toRecipient(booking.passenger);

        if (seatsReduced) {
          await context.notify(
            {
              type: 'booking.canceledByDriver',
              recipient,
              payload: {
                driverName: context.user.name,
                commuteDate: existing.date,
                commuteType: existing.type,
                orgSlug: context.orgSlug,
              },
            },
            orgContext
          );
        } else {
          await context.notify(
            {
              type: 'commute.updated',
              recipient,
              payload: {
                driverName: context.user.name,
                commuteDate: existing.date,
                commuteType: existing.type,
                orgSlug: context.orgSlug,
                newCommuteDate: commute.date,
                newCommuteType: commute.type,
              },
            },
            orgContext
          );
        }
      }

      return commute;
    }),

  cancel: procedure({ permissions: { commute: ['delete'] } })
    .route({ method: 'POST', path: '/commutes/{id}/cancel', tags })
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      const existing = await context.commutes.findForMutation(
        input.id,
        context.organizationId
      );

      assertDriverOwnership(existing, context.memberId);

      const affectedPassengers = await context.bookings.findAffectedPassengers(
        input.id
      );

      await context.commutes.delete(input.id);

      for (const booking of affectedPassengers) {
        await context.notify(
          {
            type: 'commute.canceled',
            recipient: toRecipient(booking.passenger),
            payload: {
              driverName: context.user.name,
              commuteDate: existing.date,
              commuteType: existing.type,
              orgSlug: context.orgSlug,
            },
          },
          { db: context.db, organizationId: context.organizationId }
        );
      }
    }),

  sendAlert: procedure({ permissions: { commute: ['read'] } })
    .route({ method: 'POST', path: '/commutes/{id}/alert', tags })
    .input(
      z.object({
        id: z.string(),
        alertType: z.enum(['late', 'arrived', 'custom']),
        customMessage: z.string().min(1).optional(),
        lateMinutes: z.number().int().min(1).optional(),
      })
    )
    .output(z.void())
    .handler(async ({ context, input }) => {
      const commute = await context.commutes.findByIdEnriched(
        input.id,
        context.organizationId
      );

      if (!commute) throw new ORPCError('NOT_FOUND');

      const isDriver = commute.driver.id === context.user.id;
      const orgContext = {
        db: context.db,
        organizationId: context.organizationId,
      };

      const alertPayload = {
        senderName: context.user.name,
        alertType: input.alertType,
        lateMinutes: input.lateMinutes,
        customMessage: input.customMessage,
        tripType: commute.type,
        commuteDate: commute.date,
        orgSlug: context.orgSlug,
      };

      if (isDriver) {
        const passengerIds = commute.stops.flatMap((s) =>
          s.passengers
            .filter((p) => p.status === 'ACCEPTED')
            .map((p) => p.passenger.id)
        );

        const passengerMembers = await context.db.member.findMany({
          where: {
            userId: { in: passengerIds },
            organizationId: context.organizationId,
          },
          include: { user: true, notificationPreferences: true },
        });

        for (const member of passengerMembers) {
          await context.notify(
            {
              type: 'commute.alert',
              recipient: toRecipient(member),
              payload: alertPayload,
            },
            orgContext
          );
        }
      } else {
        const driverMember = await context.db.member.findFirst({
          where: {
            userId: commute.driver.id,
            organizationId: context.organizationId,
          },
          include: { user: true, notificationPreferences: true },
        });

        if (driverMember) {
          await context.notify(
            {
              type: 'commute.alert',
              recipient: toRecipient(driverMember),
              payload: alertPayload,
            },
            orgContext
          );
        }
      }
    }),
};
