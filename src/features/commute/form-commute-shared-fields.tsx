import { PlusIcon, Trash2Icon } from 'lucide-react';
import {
  Control,
  SetFieldValue,
  useFieldArray,
  useWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import { FormFieldsCommute } from '@/features/commute/schema';
import { FormFieldLocationSelect } from '@/features/location/app/form-field-location-select';

type FormCommuteSharedFieldsProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: SetFieldValue<any>;
  ns: 'commute' | 'commuteTemplate';
  defaultStop: FormFieldsCommute['stops'][number];
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
        <FormFieldLabel required>{t(`${ns}:form.seats`)}</FormFieldLabel>
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
            variant="ghost"
            size="sm"
            onClick={() => append(defaultStop)}
          >
            <PlusIcon className="size-3" />
            {t(`${ns}:form.addStop`)}
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col gap-3 rounded-sm border border-border p-4"
            >
              <FormFieldLocationSelect
                control={control}
                name={`stops.${index}.locationId`}
                setValue={setValue}
              />
              <div className="flex items-end gap-3">
                <div className="grid min-w-0 flex-1 grid-cols-2 gap-3">
                  <FormField>
                    <FormFieldLabel required>
                      {t(`${ns}:form.outwardTime`)}
                    </FormFieldLabel>
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
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground opacity-50 hover:opacity-100"
                    onClick={() => remove(index)}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => append(defaultStop)}
        >
          <PlusIcon className="size-3" />
          {t(`${ns}:form.addStop`)}
        </Button>
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
