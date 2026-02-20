import { useInfiniteQuery } from '@tanstack/react-query';
import { SparklesIcon } from 'lucide-react';
import { Control, SetFieldValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

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

import { useAutoInwardTimes } from '@/features/commute/use-auto-inward-times';

type StepInwardStopsProps = {
  control: Control<TODO>;
  setValue: SetFieldValue<TODO>;
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

  const locationsQuery = useInfiniteQuery(
    orpc.location.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({ cursor, limit: 100 }),
      initialPageParam: undefined,
      maxPages: 1,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const locationsMap = new Map(
    locationsQuery.data?.pages
      .flatMap((p) => p.items)
      .map((loc) => [loc.id, loc.name]) ?? []
  );

  // Reverse order so stops are chronological for the return trip
  const reversedIndices = stops
    ? Array.from({ length: stops.length }, (_, i) => stops.length - 1 - i)
    : [];

  return (
    <div className="flex flex-col gap-3">
      {reversedIndices.map((index, displayPos) => {
        const stop = stops![index]!;
        // In the return trip, the last outward stop is the departure and the first is the arrival
        const isInboundDeparture = displayPos === 0;
        const isInboundArrival = displayPos === reversedIndices.length - 1;
        const stopLabel = isInboundDeparture
          ? t(`${ns}:form.departure`)
          : isInboundArrival
            ? t(`${ns}:form.arrival`)
            : (locationsMap.get(stop.locationId) ??
              t(`${ns}:form.stopIndex`, { index: index + 1 }));

        return (
          <div
            key={index}
            className="flex flex-col gap-2 rounded-sm border border-border p-4"
          >
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
