import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export type FormFieldsAccountUpdateName = z.infer<
  ReturnType<typeof zFormFieldsAccountUpdateName>
>;
export const zFormFieldsAccountUpdateName = () =>
  z.object({
    name: zu.fieldText.required(),
  });

export type FormFieldsAccountUpdatePhone = z.infer<
  ReturnType<typeof zFormFieldsAccountUpdatePhone>
>;
export const zFormFieldsAccountUpdatePhone = () =>
  z.object({
    phone: zu.fieldText.nullish(),
  });
