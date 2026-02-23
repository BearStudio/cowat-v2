import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Checkbox } from '@/components/ui/checkbox';

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
          placeholder={t('commuteTemplate:form.namePlaceholder')}
        />
      </FormField>

      <FormFieldController
        type="custom"
        control={form.control}
        name="type"
        render={({ field }) => (
          <Checkbox
            checked={field.value === 'ROUND'}
            onCheckedChange={(checked) =>
              field.onChange(checked ? 'ROUND' : 'ONEWAY')
            }
          >
            {t('commuteTemplate:form.roundTrip')}
          </Checkbox>
        )}
      />

      <FormField>
        <FormFieldLabel required>
          {t('commuteTemplate:form.seats')}
        </FormFieldLabel>
        <FormFieldController
          type="number"
          control={form.control}
          name="seats"
          min={1}
          buttons="mobile"
        />
      </FormField>

      <FormField>
        <FormFieldLabel>{t('commuteTemplate:form.comment')}</FormFieldLabel>
        <FormFieldController
          type="textarea"
          control={form.control}
          name="comment"
          placeholder={t('commuteTemplate:form.commentPlaceholder')}
        />
      </FormField>
    </div>
  );
};
