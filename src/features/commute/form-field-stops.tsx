import { PlusIcon, SparklesIcon, Trash2Icon } from 'lucide-react';
import { Control, SetFieldValue, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormField,
  FormFieldController,
  FormFieldHelper,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { FormFieldsCommute } from '@/features/commute/schema';
import { useAutoInwardTimes } from '@/features/commute/use-auto-inward-times';
import { FormFieldLocationSelect } from '@/features/location/app/form-field-location-select';

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

  const { commuteType, stops, autoComputedIndices } = useAutoInwardTimes({
    control,
    setValue,
  });

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
        {fields.map((field, index) => {
          const isRound = commuteType === 'ROUND';
          return (
            <div
              key={field.id}
              className="flex flex-col gap-3 rounded-sm border border-border p-4"
            >
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
                <div
                  className={`grid min-w-0 flex-1 gap-6 ${isRound ? 'grid-cols-2' : 'grid-cols-1'}`}
                >
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
                  {isRound && (
                    <FormField>
                      <FormFieldLabel>
                        {t(`${ns}:form.inwardTime`)}
                        {autoComputedIndices.has(index) && (
                          <FormFieldHelper>
                            <Popover>
                              <PopoverTrigger
                                aria-label={t(`${ns}:form.autoComputedHint`)}
                                className="cursor-help"
                              >
                                <SparklesIcon className="size-3 text-muted-foreground" />
                              </PopoverTrigger>
                              <PopoverContent className="w-fit max-w-xs gap-0 rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md">
                                {t(`${ns}:form.autoComputedHint`)}
                              </PopoverContent>
                            </Popover>
                          </FormFieldHelper>
                        )}
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
          );
        })}
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
