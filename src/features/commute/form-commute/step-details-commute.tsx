import dayjs from 'dayjs';
import { AlertTriangleIcon } from 'lucide-react';
import { Control, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Checkbox } from '@/components/ui/checkbox';

import type { FormFieldsCommute } from '@/features/commute/schema';

const TodayWarning = ({ control }: { control: Control<FormFieldsCommute> }) => {
  const { t } = useTranslation(['commute']);
  const selectedDate = useWatch({ control, name: 'date' });
  const isToday = selectedDate && dayjs(selectedDate).isToday();

  if (!isToday) return null;

  return (
    <p
      className="flex animate-in gap-1 text-sm text-warning-600 slide-in-from-top-1 dark:text-warning-400"
      role="status"
      aria-live="polite"
    >
      <AlertTriangleIcon size="1em" className="my-0.75 flex-none" />
      {t('commute:form.todayWarning')}
    </p>
  );
};

export const StepDetailsCommute = () => {
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
