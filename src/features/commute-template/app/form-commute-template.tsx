import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';

import { FormCommuteSharedFields } from '@/features/commute/form-commute-shared-fields';
import type { FormFieldsCommuteTemplate } from '@/features/commute-template/schema';

export const FormCommuteTemplate = () => {
  const { t } = useTranslation(['commuteTemplate']);
  const form = useFormContext<FormFieldsCommuteTemplate>();

  return (
    <div className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel required>
          {t('commuteTemplate:form.name')}
        </FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="name"
          autoFocus
        />
      </FormField>

      <FormCommuteSharedFields
        control={form.control}
        setValue={form.setValue}
        ns="commuteTemplate"
        defaultStop={{
          locationId: '',
          outwardTime: '',
          inwardTime: null,
        }}
      />
    </div>
  );
};
