import { PlusIcon, Trash2Icon } from 'lucide-react';
import { Fragment } from 'react';
import {
  Control,
  useFieldArray,
  UseFormReturn,
  useWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useFocusFieldAt } from '@/hooks/use-focus-field-at';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';

import type { FormFieldsCommuteBase } from '@/features/commute/schema';
import { FormFieldLocationSelect } from '@/features/location/app/form-field-location-select';

type StepOutwardStopsProps = {
  control: Control<FormFieldsCommuteBase>;
  setValue: UseFormReturn<FormFieldsCommuteBase>['setValue'];
  ns: 'commute' | 'commuteTemplate';
  defaultStop: FormFieldsCommuteBase['stops'][number];
};

export const StepOutwardStops = ({
  control,
  setValue,
  ns,
  defaultStop,
}: StepOutwardStopsProps) => {
  const { t } = useTranslation([ns]);
  const { fields, insert, remove } = useFieldArray({
    control,
    name: 'stops',
  });
  const stops = useWatch({
    control,
    name: 'stops',
  });
  const { containerRef, focusFieldAt } = useFocusFieldAt();

  return (
    <div ref={containerRef} className="flex flex-col gap-3 py-4">
      {fields.map((field, index) => {
        const isFirst = index === 0;
        const isLast = index === fields.length - 1;
        let stopLabel = t(`${ns}:form.stopIndex`, { index });
        if (isFirst) stopLabel = t(`${ns}:form.departure`);
        else if (isLast) stopLabel = t(`${ns}:form.arrival`);

        return (
          <Fragment key={field.id}>
            <div data-field-index={index} className="flex flex-col gap-2 py-3">
              <span className="text-sm font-semibold">{stopLabel}</span>

              <FormFieldLocationSelect
                control={control}
                name={`stops.${index}.locationId`}
                setValue={setValue}
                excludeLocationIds={stops
                  ?.filter((_, i) => i !== index)
                  .map((s) => s.locationId)
                  .filter((id): id is string => !!id)}
              />

              <div className="flex items-end gap-3">
                <div className="min-w-0 flex-1">
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
                </div>
                {fields.length > 2 && (
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

            {/* "Add stop" button between every adjacent pair of stops */}
            {!isLast && (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="w-full border border-dashed"
                onClick={() => {
                  insert(index + 1, defaultStop);
                  focusFieldAt(index + 1);
                }}
              >
                <PlusIcon className="size-3" />
                {t(`${ns}:form.addStop`)}
              </Button>
            )}
          </Fragment>
        );
      })}
    </div>
  );
};
