import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Checkbox } from '@/components/ui/checkbox';

import type { FormFieldsCommuteBase } from '@/features/commute/schema';

type StepCommuteBaseFieldsProps = {
  ns: 'commute' | 'commuteTemplate';
};

export const StepCommuteBaseFields = ({ ns }: StepCommuteBaseFieldsProps) => {
  const { t } = useTranslation([ns]);
  const form = useFormContext<FormFieldsCommuteBase>();

  return (
    <>
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
            {t(`${ns}:form.roundTrip`)}
          </Checkbox>
        )}
      />

      <FormField>
        <FormFieldLabel required>{t(`${ns}:form.seats`)}</FormFieldLabel>
        <FormFieldController
          type="number"
          control={form.control}
          name="seats"
          min={1}
          buttons="mobile"
        />
      </FormField>

      <FormField>
        <FormFieldLabel>{t(`${ns}:form.comment`)}</FormFieldLabel>
        <FormFieldController
          type="textarea"
          control={form.control}
          name="comment"
          placeholder={t(`${ns}:form.commentPlaceholder`)}
        />
      </FormField>
    </>
  );
};
