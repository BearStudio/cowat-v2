import dayjs from 'dayjs';
import { AlertTriangleIcon } from 'lucide-react';
import { Control, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';

import { FormCommuteSharedFields } from '@/features/commute/form-commute-shared-fields';
import type { FormFieldsCommute } from '@/features/commute/schema';

const TodayWarning = ({ control }: { control: Control<FormFieldsCommute> }) => {
  const { t } = useTranslation(['commute']);
  const selectedDate = useWatch({ control, name: 'date' });
  const isToday = selectedDate && dayjs(selectedDate).isToday();

  if (!isToday) return null;

  return (
    <p
      className="dark:text-warnoing-400 flex animate-in gap-1 text-sm text-warning-600 slide-in-from-top-1"
      role="status"
      aria-live="polite"
    >
      <AlertTriangleIcon size="1em" className="my-0.75 flex-none" />
      {t('commute:form.todayWarning')}
    </p>
  );
};

export const FormCommute = () => {
  const { t } = useTranslation(['commute']);
  const form = useFormContext<FormFieldsCommute>();

  const today = dayjs().startOf('day').toDate();

  return (
    <div className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel required>{t('commute:form.date')}</FormFieldLabel>
        <FormFieldController
          type="date"
          control={form.control}
          name="date"
          calendarProps={{
            disabled: (date) => date < today,
            startMonth: today,
          }}
        />
        <TodayWarning control={form.control} />
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
