import { t } from 'i18next';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

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
  z.object({
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
  });
