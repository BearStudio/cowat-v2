import { t } from 'i18next';
import { z } from 'zod';

const emptyStringAsNull = (input: string) =>
  // Cast null value to string for React Hook Form inference
  input.trim() === '' ? (null as unknown as string) : input.trim();

const emptyStringAsUndefined = (input: string) =>
  // Cast undefined value to string for React Hook Form inference
  input.trim() === '' ? (undefined as unknown as string) : input.trim();

const isValidPhoneNumber = (val: string) => {
  const digits = val.replace(/\D/g, '');
  return (
    /^[+\d][\d\s\-().]*$/.test(val) && digits.length >= 7 && digits.length <= 15
  );
};

export const zu = {
  fieldText: {
    required: (
      params: Parameters<typeof z.string>[0] = t('common:errors.required')
    ) => z.string(params).transform(emptyStringAsNull).pipe(z.string(params)),
    nullable: (
      params: Parameters<typeof z.string>[0] = t('common:errors.required')
    ) =>
      z
        .string(params)
        .transform(emptyStringAsNull)
        .nullable()
        .pipe(z.string(params).nullable()),
    nullish: (
      params: Parameters<typeof z.string>[0] = t('common:errors.required')
    ) =>
      z
        .string(params)
        .transform(emptyStringAsNull)
        .nullish()
        .pipe(z.string(params).nullish()),
    optional: (
      params: Parameters<typeof z.string>[0] = t('common:errors.required')
    ) =>
      z
        .string(params)
        .transform(emptyStringAsUndefined)
        .optional()
        .pipe(z.string(params).optional()),
  },
  fieldPhone: {
    nullish: (invalidMessage: string = t('common:errors.phoneInvalid')) =>
      z
        .string()
        .transform(emptyStringAsNull)
        .nullish()
        .pipe(
          z
            .string()
            .nullish()
            .superRefine((val, ctx) => {
              if (val != null && !isValidPhoneNumber(val)) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: invalidMessage,
                });
              }
            })
        ),
  },
};
