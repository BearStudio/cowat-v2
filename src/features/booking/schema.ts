import { z } from 'zod';

import { zLocationSummary } from '@/features/location/schema';
import { zUserSummary } from '@/features/user/schema';

export const zRequestStatus = () =>
  z.enum(['REQUESTED', 'ACCEPTED', 'REFUSED', 'CANCELED']);
export type RequestStatus = z.infer<ReturnType<typeof zRequestStatus>>;

const zStopStatus = () => z.enum(['UNKNOWN', 'ON_TIME', 'AWAITING', 'DELAYED']);

export const zTripType = () => z.enum(['ROUND', 'ONEWAY', 'RETURN']);
export type TripType = z.infer<ReturnType<typeof zTripType>>;

export const zBooking = () =>
  z.object({
    id: z.string(),
    status: zRequestStatus(),
    stopStatus: zStopStatus(),
    tripType: zTripType(),
    delay: z.number().int().nullish(),
    comment: z.string().nullish(),
    isDeleted: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    passengerMemberId: z.string(),
    stopId: z.string(),
  });

export const zBookingRequest = () =>
  z.object({
    stopId: z.string(),
    tripType: zTripType(),
    comment: z.string().nullish(),
  });

export type BookingForDriver = z.infer<ReturnType<typeof zBookingForDriver>>;
export const zBookingForDriver = () =>
  zBooking().extend({
    passenger: zUserSummary(),
    stop: z.object({
      id: z.string(),
      order: z.number(),
      outwardTime: z.string(),
      inwardTime: z.string().nullish(),
      location: zLocationSummary(),
      commute: z.object({
        id: z.string(),
        date: z.date(),
        type: z.enum(['ROUND', 'ONEWAY']),
      }),
    }),
  });
