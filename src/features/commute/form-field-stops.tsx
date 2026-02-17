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

import { FormFieldsCommute } from '@/features/commute/schema';
import { FormFieldLocationSelect } from '@/features/location/app/form-field-location-select';

/**
 * Isolated component that watches stops to compute excluded location IDs.
 * Only this component re-renders when a sibling stop's location changes.
 */
const StopLocationSelect = ({
  control,
  setValue,
  index,
}: {
  control: Control<TODO>;
  setValue: SetFieldValue<TODO>;
  index: number;
}) => {
  const stops = useWatch({ control, name: 'stops' }) as
    | { locationId?: string }[]
    | undefined;

  return (
    <FormFieldLocationSelect
      control={control}
      name={`stops.${index}.locationId`}
      setValue={setValue}
      excludeLocationIds={stops
        ?.filter((_, i) => i !== index)
        .map((s) => s.locationId)
        .filter((id): id is string => !!id)}
    />
  );
};

type FormFieldStopsProps = {
  control: Control<TODO>;
  setValue: SetFieldValue<TODO>;
  ns: 'commute' | 'commuteTemplate';
  defaultStop: FormFieldsCommute['stops'][number];
};

export const FormFieldStops = ({
  control,
  setValue,
  ns,
  defaultStop,
}: FormFieldStopsProps) => {
  const { t } = useTranslation([ns]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'stops',
  });

  const commuteType = useWatch({ control, name: 'type' });

  return (
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
            <StopLocationSelect
              control={control}
              setValue={setValue}
              index={index}
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
  );
};
