import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';

import { StepCommuteBaseFields } from '@/features/commute/form-commute/step-commute-base-fields';
import type { FormFieldsCommuteTemplate } from '@/features/commute-template/schema';

export const StepDetailsTemplate = () => {
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
          autoComplete="off"
          placeholder={t('commuteTemplate:form.namePlaceholder')}
        />
      </FormField>

      <StepCommuteBaseFields ns="commuteTemplate" />
    </div>
  );
};
