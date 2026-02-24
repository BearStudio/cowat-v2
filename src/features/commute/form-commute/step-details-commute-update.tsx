import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Checkbox } from '@/components/ui/checkbox';

import type { FormFieldsCommuteUpdate } from '@/features/commute/schema';

export const StepDetailsCommuteUpdate = () => {
  const { t } = useTranslation(['commute']);
  const form = useFormContext<FormFieldsCommuteUpdate>();

  return (
    <div className="flex flex-col gap-4">
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
            {t('commute:form.roundTrip')}
          </Checkbox>
        )}
      />

      <FormField>
        <FormFieldLabel required>{t('commute:form.seats')}</FormFieldLabel>
        <FormFieldController
          type="number"
          control={form.control}
          name="seats"
          min={1}
          buttons="mobile"
        />
      </FormField>

      <FormField>
        <FormFieldLabel>{t('commute:form.comment')}</FormFieldLabel>
        <FormFieldController
          type="textarea"
          control={form.control}
          name="comment"
          placeholder={t('commute:form.commentPlaceholder')}
        />
      </FormField>
    </div>
  );
};
