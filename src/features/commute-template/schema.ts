import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import { zCommuteType } from '@/features/commute/schema';

export type CommuteTemplate = z.infer<ReturnType<typeof zCommuteTemplate>>;
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
  z.object({
    name: zu.fieldText.required(),
    seats: z.number().int().min(1),
    type: zCommuteType(),
    comment: zu.fieldText.nullish(),
    stops: z.array(zFormFieldsTemplateStopInput()).min(2),
  });

export type FormFieldsTemplateStopInput = z.infer<
  ReturnType<typeof zFormFieldsTemplateStopInput>
>;
export const zFormFieldsTemplateStopInput = () =>
  z.object({
    locationId: zu.fieldText.required(),
    outwardTime: zu.fieldText.required(),
    inwardTime: zu.fieldText.nullish(),
  });

export type TemplateStop = z.infer<ReturnType<typeof zTemplateStop>>;
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

export type TemplateStopWithLocation = z.infer<
  ReturnType<typeof zTemplateStopWithLocation>
>;
export const zTemplateStopWithLocation = () =>
  zTemplateStop().extend({
    location: z.object({
      id: z.string(),
      name: z.string(),
    }),
  });
