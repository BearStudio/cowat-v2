import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';

import { FormFieldsLocation } from '@/features/location/schema';

export const FormLocation = () => {
  const { t } = useTranslation(['location']);
  const form = useFormContext<FormFieldsLocation>();

  return (
    <div className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>{t('location:form.name')}</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="name"
          autoFocus
        />
      </FormField>
      <FormField>
        <FormFieldLabel>{t('location:form.address')}</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="address"
        />
      </FormField>
    </div>
  );
};
