import dayjs from 'dayjs';
import { t } from 'i18next';
import { Control, FieldValues, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import { zRequestStatus, zTripType } from '@/features/booking/schema';
import {
  createCommuteRules,
  createStopOrderRules,
} from '@/features/commute/form-commute-rules';
import { zLocationSummary } from '@/features/location/schema';
import { zUserSummary } from '@/features/user/schema';

export const zCommuteType = () => z.enum(['ROUND', 'ONEWAY']);
export type CommuteType = z.infer<ReturnType<typeof zCommuteType>>;

const zCommuteStatus = () => z.enum(['UNKNOWN', 'ON_TIME', 'DELAYED']);

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
    driverMemberId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  });

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

/**
 * Shared fields between FormFieldsCommute and FormFieldsCommuteTemplate.
 * Used as the concrete type for shared form components.
 */
export type FormFieldsCommuteBase = {
  seats: number;
  type: CommuteType;
  comment?: string | null | undefined;
  stops: Array<{
    outwardTime: string;
    inwardTime?: string | null | undefined;
    locationId: string;
  }>;
};

/**
 * Type-safe bridge for passing a form typed with a specific commute schema
 * (FormFieldsCommute or FormFieldsCommuteTemplate) to shared components
 * that use FormFieldsCommuteBase.
 *
 * Control<T> is invariant, so we need this cast. The generic constraint
 * ensures only forms whose fields are a superset of FormFieldsCommuteBase
 * can be bridged.
 */
export function asCommuteBase<
  T extends FormFieldsCommuteBase & FieldValues,
>(form: { control: Control<T>; setValue: UseFormReturn<T>['setValue'] }) {
  return form as unknown as {
    control: Control<FormFieldsCommuteBase>;
    setValue: UseFormReturn<FormFieldsCommuteBase>['setValue'];
  };
}

const zFormFieldsCommuteShared = () =>
  z.object({
    seats: z
      .number({ error: t('common:errors.required') })
      .int()
      .min(1, t('commute:form.errors.seatsMin')),
    type: zCommuteType(),
    comment: zu.fieldText.nullish(),
    stops: z
      .array(zFormFieldsStopInput())
      .min(2, t('commute:form.errors.stopsMin')),
  });

export type FormFieldsCommute = z.infer<ReturnType<typeof zFormFieldsCommute>>;
export const zFormFieldsCommute = () =>
  zFormFieldsCommuteShared()
    .extend({
      date: z
        .date({
          error: t('common:errors.required'),
        })
        .refine((date) => !dayjs(date).isBefore(dayjs(), 'day'), {
          message: t('commute:form.errors.datePast'),
        }),
    })
    .superRefine((data, ctx) => {
      const rules = createCommuteRules(data);

      data.stops.forEach((stop, index) => {
        if (!rules.isOutwardInFuture(stop)) {
          ctx.addIssue({
            code: 'custom',
            message: t('commute:form.errors.outwardInPast'),
            path: ['stops', index, 'outwardTime'],
          });
        }

        if (!rules.shouldInwardBeAfterOutward(stop)) {
          ctx.addIssue({
            code: 'custom',
            message: t('commute:form.errors.inwardBeforeOutward'),
            path: ['stops', index, 'inwardTime'],
          });
        }

        if (!rules.isInwardInFuture(stop)) {
          ctx.addIssue({
            code: 'custom',
            message: t('commute:form.errors.inwardInPast'),
            path: ['stops', index, 'inwardTime'],
          });
        }

        if (!rules.shouldOutwardBeIncreasing(stop, index)) {
          ctx.addIssue({
            code: 'custom',
            message: t('commute:form.errors.outwardNotIncreasing'),
            path: ['stops', index, 'outwardTime'],
          });
        }

        if (!rules.shouldInwardBeDecreasing(stop, index)) {
          ctx.addIssue({
            code: 'custom',
            message: t('commute:form.errors.inwardNotDecreasing'),
            path: ['stops', index, 'inwardTime'],
          });
        }
      });
    });

export type FormFieldsCommuteUpdate = z.infer<
  ReturnType<typeof zFormFieldsCommuteUpdate>
>;
export const zFormFieldsCommuteUpdate = () =>
  zFormFieldsCommuteShared().superRefine((data, ctx) => {
    const rules = createStopOrderRules(data);

    data.stops.forEach((stop, index) => {
      if (!rules.shouldInwardBeAfterOutward(stop)) {
        ctx.addIssue({
          code: 'custom',
          message: t('commute:form.errors.inwardBeforeOutward'),
          path: ['stops', index, 'inwardTime'],
        });
      }

      if (!rules.shouldOutwardBeIncreasing(stop, index)) {
        ctx.addIssue({
          code: 'custom',
          message: t('commute:form.errors.outwardNotIncreasing'),
          path: ['stops', index, 'outwardTime'],
        });
      }

      if (!rules.shouldInwardBeDecreasing(stop, index)) {
        ctx.addIssue({
          code: 'custom',
          message: t('commute:form.errors.inwardNotDecreasing'),
          path: ['stops', index, 'inwardTime'],
        });
      }
    });
  });

export type FormFieldsCommuteRequest = z.infer<
  ReturnType<typeof zFormFieldsCommuteRequest>
>;
export const zFormFieldsCommuteRequest = () =>
  z.object({
    date: z
      .date({ error: t('common:errors.required') })
      .refine((date) => !dayjs(date).isBefore(dayjs(), 'day'), {
        message: t('commute:form.errors.datePast'),
      }),
    destination: zu.fieldText.nullish(),
    comment: zu.fieldText.nullish(),
  });

export type StopPassenger = z.infer<ReturnType<typeof zStopPassenger>>;
export const zStopPassenger = () =>
  z.object({
    id: z.string(),
    status: zRequestStatus(),
    tripType: zTripType(),
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
