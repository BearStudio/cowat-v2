import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import {
  FormField,
  FormFieldController,
  FormFieldHelper,
  FormFieldLabel,
} from '@/components/form';

import { FormFieldsOrg } from '@/features/organization/manager/page-organization-new';

function toSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-/, '')
    .replace(/-$/, '');
}

const SlugSync = () => {
  const { setValue, control } = useFormContext<FormFieldsOrg>();
  const name = useWatch({ control, name: 'name' });
  const { touchedFields } = useFormState({ control });

  useEffect(() => {
    if (!touchedFields.slug) {
      setValue('slug', toSlug(name));
    }
  }, [name, touchedFields.slug, setValue]);

  return null;
};

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
      <SlugSync />
      <FormField>
        <FormFieldLabel required>
          {t('organization:create.name')}
        </FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="name"
          autoFocus
        />
      </FormField>
      <FormField>
        <FormFieldLabel required>
          {t('organization:create.slug')}
        </FormFieldLabel>
        <FormFieldController type="text" control={form.control} name="slug" />
        <FormFieldHelper>{t('organization:create.slugHelper')}</FormFieldHelper>
      </FormField>
      <FormField>
        <FormFieldLabel required>
          {t('organization:create.owner')}
        </FormFieldLabel>
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
