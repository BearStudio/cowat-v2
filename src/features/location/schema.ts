import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export const zLocation = () =>
  z.object({
    id: z.string(),
    name: zu.fieldText.required(),
    address: zu.fieldText.required(),
    latitude: z.number().nullish(),
    longitude: z.number().nullish(),
    isDeleted: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    memberId: z.string(),
  });

export type FormFieldsLocation = z.infer<
  ReturnType<typeof zFormFieldsLocation>
>;
export const zFormFieldsLocation = () =>
  zLocation().pick({
    name: true,
    address: true,
    latitude: true,
    longitude: true,
  });
