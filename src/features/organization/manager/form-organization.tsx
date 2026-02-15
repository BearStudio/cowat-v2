import { useQuery } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';

import { FormFieldsOrg } from '@/features/organization/manager/page-organization-new';

export const FormOrganization = () => {
  const { t } = useTranslation(['organization']);
  const form = useFormContext<FormFieldsOrg>();

  const usersQuery = useQuery(
    orpc.user.getAll.queryOptions({
      input: { limit: 100 },
    })
  );

  return (
    <div className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>{t('organization:create.name')}</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="name"
          autoFocus
        />
      </FormField>
      <FormField>
        <FormFieldLabel>{t('organization:create.slug')}</FormFieldLabel>
        <FormFieldController type="text" control={form.control} name="slug" />
      </FormField>
      <FormField>
        <FormFieldLabel>{t('organization:create.owner')}</FormFieldLabel>
        <FormFieldController
          type="select"
          control={form.control}
          name="ownerUserId"
          items={
            usersQuery.data?.items.map((user) => ({
              value: user.id,
              label: `${user.name} (${user.email})`,
            })) ?? []
          }
        />
      </FormField>
    </div>
  );
};
