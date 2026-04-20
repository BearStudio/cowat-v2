import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export const zFormFieldsAccountUpdateName = () =>
  z.object({
    name: zu.fieldText.required(),
  });

export const zFormFieldsAccountUpdatePhone = () =>
  z.object({
    phone: zu.fieldPhone.nullish(),
  });

export const zFormFieldsAccountUpdateImage = () =>
  z.object({
    image: zu.fieldText.nullish(),
  });
