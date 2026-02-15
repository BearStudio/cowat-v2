import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

import { FormFieldLocationSelect } from '@/features/location/app/form-field-location-select';

type FormCommuteSharedFieldsProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: any;
  ns: 'commute' | 'commuteTemplate';
  defaultStop: Record<string, unknown>;
};

export const FormCommuteSharedFields = ({
  control,
  setValue,
  ns,
  defaultStop,
}: FormCommuteSharedFieldsProps) => {
  const { t } = useTranslation([ns]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'stops',
  });

  const commuteType = useWatch({ control, name: 'type' });

  return (
    <>
      <FormField>
        <FormFieldLabel>{t(`${ns}:form.seats`)}</FormFieldLabel>
        <FormFieldController
          type="number"
          control={control}
          name="seats"
          min={1}
          buttons="mobile"
        />
      </FormField>

      <FormFieldController
        type="custom"
        control={control}
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

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t(`${ns}:form.stops`)}</span>
          <Button
            type="button"
            variant="secondary"
            size="xs"
            onClick={() => append(defaultStop)}
          >
            <PlusIcon className="size-3" />
            {t(`${ns}:form.addStop`)}
          </Button>
        </div>

        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader className="flex-row items-center justify-between py-2">
              <CardTitle className="text-sm">
                {t(`${ns}:form.stopIndex`, { index: index + 1 })}
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
                control={control}
                name={`stops.${index}.locationId`}
                setValue={setValue}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField>
                  <FormFieldLabel>{t(`${ns}:form.outwardTime`)}</FormFieldLabel>
                  <FormFieldController
                    type="time"
                    control={control}
                    name={`stops.${index}.outwardTime`}
                  />
                </FormField>
                {commuteType === 'ROUND' && (
                  <FormField>
                    <FormFieldLabel>
                      {t(`${ns}:form.inwardTime`)}
                    </FormFieldLabel>
                    <FormFieldController
                      type="time"
                      control={control}
                      name={`stops.${index}.inwardTime`}
                    />
                  </FormField>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <FormField>
        <FormFieldLabel>{t(`${ns}:form.comment`)}</FormFieldLabel>
        <FormFieldController
          type="textarea"
          control={control}
          name="comment"
          placeholder={t(`${ns}:form.commentPlaceholder`)}
        />
      </FormField>
    </>
  );
};
