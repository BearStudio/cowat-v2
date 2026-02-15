import dayjs from 'dayjs';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';

import { FormCommuteSharedFields } from '@/features/commute/form-commute-shared-fields';
import type { FormFieldsCommute } from '@/features/commute/schema';

export const FormCommute = () => {
  const { t } = useTranslation(['commute']);
  const form = useFormContext<FormFieldsCommute>();

  const today = dayjs().startOf('day').toDate();

  return (
    <div className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>{t('commute:form.date')}</FormFieldLabel>
        <FormFieldController
          type="date"
          control={form.control}
          name="date"
          calendarProps={{
            disabled: (date) => date < today,
            startMonth: today,
          }}
        />
      </FormField>

      <FormCommuteSharedFields
        control={form.control}
        setValue={form.setValue}
        ns="commute"
        defaultStop={{ locationId: '', outwardTime: '', inwardTime: null }}
      />
    </div>
  );
};
