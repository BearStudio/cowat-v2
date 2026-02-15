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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import type { FormFieldsCommuteTemplate } from '@/features/commute-template/schema';
import { FormFieldLocationSelect } from '@/features/location/app/form-field-location-select';

export const FormCommuteTemplate = () => {
  const { t } = useTranslation(['commuteTemplate']);
  const form = useFormContext<FormFieldsCommuteTemplate>();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'stops',
  });

  const commuteType = useWatch({ control: form.control, name: 'type' });

  return (
    <div className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>{t('commuteTemplate:form.name')}</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="name"
          autoFocus
        />
      </FormField>

      <FormField>
        <FormFieldLabel>{t('commuteTemplate:form.seats')}</FormFieldLabel>
        <FormFieldController
          type="number"
          control={form.control}
          name="seats"
          min={1}
          buttons="mobile"
        />
      </FormField>

      <FormFieldController
        type="custom"
        control={form.control}
        name="type"
        render={({ field }) => (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={field.value === 'ROUND'}
              onCheckedChange={(checked) =>
                field.onChange(checked ? 'ROUND' : 'ONEWAY')
              }
            />
            <Label
              onClick={() =>
                field.onChange(field.value === 'ROUND' ? 'ONEWAY' : 'ROUND')
              }
            >
              {t('commuteTemplate:form.roundTrip')}
            </Label>
          </div>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField>
          <FormFieldLabel>
            {t('commuteTemplate:form.outwardTime')}
          </FormFieldLabel>
          <FormFieldController
            type="time"
            control={form.control}
            name="outwardTime"
          />
        </FormField>
        {commuteType === 'ROUND' && (
          <FormField>
            <FormFieldLabel>
              {t('commuteTemplate:form.inwardTime')}
            </FormFieldLabel>
            <FormFieldController
              type="time"
              control={form.control}
              name="inwardTime"
            />
          </FormField>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {t('commuteTemplate:form.stops')}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="xs"
            onClick={() => append({ locationId: '', order: 0 })}
          >
            <PlusIcon className="size-3" />
            {t('commuteTemplate:form.addStop')}
          </Button>
        </div>

        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader className="flex-row items-center justify-between py-2">
              <CardTitle className="text-sm">
                {t('commuteTemplate:form.stopIndex', { index: index + 1 })}
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
            <CardContent>
              <FormFieldLocationSelect
                control={form.control}
                name={`stops.${index}.locationId`}
                setValue={form.setValue}
              />
            </CardContent>
          </Card>
        ))}
      </div>

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
