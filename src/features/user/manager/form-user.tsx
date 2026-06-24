import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useCan } from '@/hooks/use-can';

import {
  FormField,
  FormFieldController,
  FormFieldHelper,
  FormFieldLabel,
} from '@/components/form';

import { isNotSelfByUserId } from '@/features/auth/ability/abilities';
import { rolesNames } from '@/features/auth/permissions';
import { FormFieldsUser } from '@/features/user/schema';

export const FormUser = (props: { userId?: string }) => {
  const { t } = useTranslation(['user']);
  const { actor } = useCan();
  const form = useFormContext<FormFieldsUser>();
  // Editing yourself: you can't change your own role (server enforces it too).
  const isCurrentUser =
    !!props.userId && !!actor && !isNotSelfByUserId(actor, props.userId, '').ok;

  return (
    <div className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>{t('user:common.name.label')}</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="name"
          autoFocus
        />
      </FormField>
      <FormField>
        <FormFieldLabel required>{t('user:common.email.label')}</FormFieldLabel>
        <FormFieldController type="email" control={form.control} name="email" />
      </FormField>
      <FormField>
        <FormFieldLabel>{t('user:common.role.label')}</FormFieldLabel>
        <FormFieldController
          type="select"
          control={form.control}
          name="role"
          disabled={isCurrentUser}
          items={rolesNames.map((role) => ({
            value: role,
            label: role,
          }))}
        />
        {isCurrentUser && (
          <FormFieldHelper>
            {t('user:common.role.cannotUpdateOwnRole')}
          </FormFieldHelper>
        )}
      </FormField>
    </div>
  );
};
