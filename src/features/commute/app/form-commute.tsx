import dayjs from 'dayjs';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { FormFieldsCommute } from '@/features/commute/schema';
import { zCommuteType } from '@/features/commute/schema';
import { FormFieldLocationSelect } from '@/features/location/app/form-field-location-select';

export const FormCommute = () => {
  const { t } = useTranslation(['commute']);
  const form = useFormContext<FormFieldsCommute>();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'stops',
  });

  const today = dayjs().startOf('day').toDate();

  const commuteTypeOptions = zCommuteType().options.map((value) => ({
    label: t(`commute:form.typeOptions.${value}`),
    value,
  }));

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

      <div className="grid grid-cols-2 gap-4">
        <FormField>
          <FormFieldLabel>{t('commute:form.seats')}</FormFieldLabel>
          <FormFieldController
            type="number"
            control={form.control}
            name="seats"
            min={1}
            buttons="mobile"
          />
        </FormField>

        <FormField>
          <FormFieldLabel>{t('commute:form.type')}</FormFieldLabel>
          <FormFieldController
            type="select"
            control={form.control}
            name="type"
            items={commuteTypeOptions}
          />
        </FormField>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t('commute:form.stops')}</span>
          <Button
            type="button"
            variant="secondary"
            size="xs"
            onClick={() =>
              append({ locationId: '', outwardTime: '', inwardTime: null })
            }
          >
            <PlusIcon className="size-3" />
            {t('commute:form.addStop')}
          </Button>
        </div>

        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader className="flex-row items-center justify-between py-2">
              <CardTitle className="text-sm">
                {t('commute:form.stopIndex', { index: index + 1 })}
              </CardTitle>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => remove(index)}
                >
                  <Trash2Icon className="size-3" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <FormFieldLocationSelect
                control={form.control}
                name={`stops.${index}.locationId`}
              />
              <StopTimeFields index={index} />
            </CardContent>
          </Card>
        ))}
      </div>

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

const StopTimeFields = ({ index }: { index: number }) => {
  const { t } = useTranslation(['commute']);
  const form = useFormContext<FormFieldsCommute>();
  const commuteType = useWatch({ control: form.control, name: 'type' });

  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField>
        <FormFieldLabel>{t('commute:form.outwardTime')}</FormFieldLabel>
        <FormFieldController
          type="time"
          control={form.control}
          name={`stops.${index}.outwardTime`}
        />
      </FormField>
      {commuteType === 'ROUND' && (
        <FormField>
          <FormFieldLabel>{t('commute:form.inwardTime')}</FormFieldLabel>
          <FormFieldController
            type="time"
            control={form.control}
            name={`stops.${index}.inwardTime`}
          />
        </FormField>
      )}
    </div>
  );
};
