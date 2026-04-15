import { SparklesIcon } from 'lucide-react';
import { Control, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormField,
  FormFieldController,
  FormFieldHelper,
  FormFieldLabel,
} from '@/components/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import type { FormFieldsCommuteBase } from '@/features/commute/schema';
import { useAutoInwardTimes } from '@/features/commute/use-auto-inward-times';
import { useAllLocations } from '@/features/location/use-all-locations';

type StepInwardStopsProps = {
  control: Control<FormFieldsCommuteBase>;
  setValue: UseFormReturn<FormFieldsCommuteBase>['setValue'];
  ns: 'commute' | 'commuteTemplate';
};

export const StepInwardStops = ({
  control,
  setValue,
  ns,
}: StepInwardStopsProps) => {
  const { t } = useTranslation([ns]);
  const { stops, autoComputedIndices } = useAutoInwardTimes({
    control,
    setValue,
  });

  const { personalQuery, orgQuery } = useAllLocations();

  const locationsMap = new Map(
    [
      ...(orgQuery.data?.pages.flatMap((p) => p.items) ?? []),
      ...(personalQuery.data?.pages.flatMap((p) => p.items) ?? []),
    ].map((loc) => [loc.id, loc.name] as const)
  );

  // Reverse order so stops are chronological for the return trip
  const reversedIndices = stops
    ? Array.from({ length: stops.length }, (_, i) => stops.length - 1 - i)
    : [];

  return (
    <div className="flex flex-col gap-3">
      {reversedIndices.map((index, displayPos) => {
        const stop = stops?.[index];
        if (!stop) return null;
        // In the return trip, the last outward stop is the departure and the first is the arrival
        const isInboundDeparture = displayPos === 0;
        const isInboundArrival = displayPos === reversedIndices.length - 1;
        let stopLabel =
          locationsMap.get(stop.locationId) ??
          t(`${ns}:form.stopIndex`, { index: index + 1 });
        if (isInboundDeparture) stopLabel = t(`${ns}:form.departure`);
        else if (isInboundArrival) stopLabel = t(`${ns}:form.arrival`);

        return (
          <div key={index} className="flex flex-col gap-2 py-3">
            <span className="truncate text-sm font-semibold">{stopLabel}</span>
            {(isInboundDeparture || isInboundArrival) && (
              <span className="truncate text-xs text-muted-foreground">
                {locationsMap.get(stop.locationId)}
              </span>
            )}
            <p className="text-xs text-muted-foreground">
              {t(`${ns}:form.outwardTime`)}: {stop.outwardTime}
            </p>

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
          </div>
        );
      })}
    </div>
  );
};
