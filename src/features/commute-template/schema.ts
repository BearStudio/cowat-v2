import { t } from 'i18next';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import { createStopOrderRules } from '@/features/commute/form-commute-rules';
import { zCommuteType } from '@/features/commute/schema';
import { zLocationSummary } from '@/features/location/schema';

export const zCommuteTemplate = () =>
  z.object({
    id: z.string(),
    name: zu.fieldText.required(),
    seats: z.number().int().min(1),
    type: zCommuteType(),
    comment: z.string().nullish(),
    isDeleted: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    driverMemberId: z.string(),
  });

export type FormFieldsCommuteTemplate = z.infer<
  ReturnType<typeof zFormFieldsCommuteTemplate>
>;
export const zFormFieldsCommuteTemplate = () =>
  z
    .object({
      name: zu.fieldText.required(),
      seats: z
        .number({ error: t('common:errors.required') })
        .int()
        .min(1, t('commuteTemplate:form.errors.seatsMin')),
      type: zCommuteType(),
      comment: zu.fieldText.nullish(),
      stops: z
        .array(zFormFieldsTemplateStopInput())
        .min(2, t('commuteTemplate:form.errors.stopsMin')),
    })
    .superRefine((data, ctx) => {
      const rules = createStopOrderRules(data);

      data.stops.forEach((stop, index) => {
        if (!rules.shouldInwardBeDecreasing(stop, index)) {
          ctx.addIssue({
            code: 'custom',
            message: t('commuteTemplate:form.errors.inwardNotDecreasing'),
            path: ['stops', index, 'inwardTime'],
          });
        }
      });
    });

export const zFormFieldsTemplateStopInput = () =>
  z.object({
    locationId: zu.fieldText.required(),
    outwardTime: zu.fieldText.required(),
    inwardTime: zu.fieldText.nullish(),
  });

export const zTemplateStop = () =>
  z.object({
    id: z.string(),
    order: z.number().int().min(0),
    outwardTime: z.string(),
    inwardTime: z.string().nullish(),
    templateId: z.string(),
    locationId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  });

export const zTemplateStopWithLocation = () =>
  zTemplateStop().extend({
    location: zLocationSummary(),
  });
