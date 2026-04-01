import { t } from 'i18next';
import { z } from 'zod';

export type FormFieldsOrg = z.infer<ReturnType<typeof zFormFieldsOrg>>;
export const zFormFieldsOrg = () =>
  z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(100),
    ownerUserId: z.string().min(1),
  });

export const zInviteForm = () =>
  z.object({
    emails: z
      .array(z.string())
      .min(1, t('organization:members.emailsRequired'))
      .superRefine((emails, ctx) => {
        const invalid = emails.filter(
          (email) => !z.string().email().safeParse(email).success
        );
        if (invalid.length > 0) {
          ctx.addIssue({
            code: 'custom',
            message: t('organization:members.emailInvalid', {
              email: invalid[0],
            }),
          });
        }
      }),
    role: z.enum(['owner', 'member']),
  });
