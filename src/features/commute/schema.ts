import dayjs from 'dayjs';
import { t } from 'i18next';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import {
  isInwardAfterOutward,
  isTimeInFuture,
} from '@/features/commute/form-commute-rules';
import { zLocation } from '@/features/location/schema';
import { zUser } from '@/features/user/schema';

export const zCommuteType = () => z.enum(['ROUND', 'ONEWAY']);
export type CommuteType = z.infer<ReturnType<typeof zCommuteType>>;

export const zCommuteStatus = () => z.enum(['UNKNOWN', 'ON_TIME', 'DELAYED']);
export type CommuteStatus = z.infer<ReturnType<typeof zCommuteStatus>>;

export type Commute = z.infer<ReturnType<typeof zCommute>>;
export const zCommute = () =>
  z.object({
    id: z.string(),
    date: z.date(),
    seats: z.number().int().min(1),
    type: zCommuteType(),
    status: zCommuteStatus(),
    delay: z.number().int().nullish(),
    comment: z.string().nullish(),
    driverId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  });

export type Stop = z.infer<ReturnType<typeof zStop>>;
export const zStop = () =>
  z.object({
    id: z.string(),
    order: z.number().int().min(0),
    outwardTime: z.string(),
    inwardTime: z.string().nullish(),
    locationId: z.string(),
    commuteId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  });

export type StopInput = z.infer<ReturnType<typeof zStopInput>>;
export const zStopInput = () =>
  z.object({
    order: z.number().int().min(0),
    outwardTime: z.string(),
    inwardTime: z.string().nullish(),
    locationId: z.string(),
  });

export type FormFieldsStopInput = z.infer<
  ReturnType<typeof zFormFieldsStopInput>
>;
export const zFormFieldsStopInput = () =>
  z.object({
    outwardTime: zu.fieldText.required(t('common:errors.required')),
    inwardTime: zu.fieldText.nullish(),
    locationId: zu.fieldText.required(t('common:errors.required')),
  });

export type FormFieldsCommute = z.infer<ReturnType<typeof zFormFieldsCommute>>;
export const zFormFieldsCommute = () =>
  z
    .object({
      date: z.date({ error: t('common:errors.required') }),
      seats: z
        .number({ error: t('common:errors.required') })
        .int()
        .min(1, t('commute:form.errors.seatsMin')),
      type: zCommuteType(),
      comment: zu.fieldText.nullish(),
      stops: z
        .array(zFormFieldsStopInput())
        .min(1, t('commute:form.errors.stopsMin')),
    })
    .superRefine((data, ctx) => {
      const isToday = dayjs(data.date).isToday();

      data.stops.forEach((stop, index) => {
        if (
          isToday &&
          stop.outwardTime &&
          !isTimeInFuture(data.date, stop.outwardTime)
        ) {
          ctx.addIssue({
            code: 'custom',
            message: t('commute:form.errors.outwardInPast'),
            path: ['stops', index, 'outwardTime'],
          });
        }

        if (
          data.type === 'ROUND' &&
          stop.inwardTime &&
          stop.outwardTime &&
          !isInwardAfterOutward(stop.outwardTime, stop.inwardTime)
        ) {
          ctx.addIssue({
            code: 'custom',
            message: t('commute:form.errors.inwardBeforeOutward'),
            path: ['stops', index, 'inwardTime'],
          });
        }

        if (
          isToday &&
          data.type === 'ROUND' &&
          stop.inwardTime &&
          !isTimeInFuture(data.date, stop.inwardTime)
        ) {
          ctx.addIssue({
            code: 'custom',
            message: t('commute:form.errors.inwardInPast'),
            path: ['stops', index, 'inwardTime'],
          });
        }
      });
    });

export type UserSummary = z.infer<ReturnType<typeof zUserSummary>>;
export const zUserSummary = () =>
  zUser().pick({ id: true, name: true, image: true });

export type LocationSummary = z.infer<ReturnType<typeof zLocationSummary>>;
export const zLocationSummary = () =>
  zLocation().pick({ id: true, name: true });

export type StopPassenger = z.infer<ReturnType<typeof zStopPassenger>>;
export const zStopPassenger = () =>
  z.object({
    id: z.string(),
    status: z.enum(['REQUESTED', 'ACCEPTED', 'REFUSED', 'CANCELED']),
    tripType: z.enum(['ROUND', 'ONEWAY', 'RETURN']),
    comment: z.string().nullish(),
    passenger: zUserSummary(),
  });

export type StopEnriched = z.infer<ReturnType<typeof zStopEnriched>>;
export const zStopEnriched = () =>
  zStop().extend({
    location: zLocationSummary(),
    passengers: z.array(zStopPassenger()),
  });

export type CommuteEnriched = z.infer<ReturnType<typeof zCommuteEnriched>>;
export const zCommuteEnriched = () =>
  zCommute().extend({
    driver: zUserSummary(),
    stops: z.array(zStopEnriched()),
  });
