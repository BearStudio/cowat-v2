import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { type Control, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { tripTypeIcons } from '@/lib/feature-icons';
import { orpc } from '@/lib/orpc/client';

import { CommentText } from '@/components/comment-text';
import { Badge } from '@/components/ui/badge';

import type {
  FormFieldsCommuteBase,
  StopPassenger,
} from '@/features/commute/schema';
import {
  type StopForTimeline,
  StopsTimelineItem,
} from '@/features/commute/stops-timeline';
import {
  computeDayOffsets,
  formatTripDate,
  stopDayLabel,
  tripCrossesMidnight,
} from '@/features/commute/time-utils';

type StepRecapProps = {
  control: Control<FormFieldsCommuteBase>;
  ns: 'commute' | 'commuteTemplate';
  passengersByLocationId?: Map<string, StopPassenger[]>;
  /**
   * Commute date, used to show the exact date when a leg crosses midnight.
   * Falls back to the form's `date` field when omitted (creation flow).
   */
  tripDate?: Date | null;
};

export const StepRecap = ({
  control,
  ns,
  passengersByLocationId,
  tripDate: tripDateProp,
}: StepRecapProps) => {
  const { t } = useTranslation([ns, 'commute', 'common']);
  const values = useWatch({ control }) as FormFieldsCommuteBase &
    Record<string, unknown>;

  const locationsQuery = useInfiniteQuery(
    orpc.location.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({ cursor, limit: 100 }),
      initialPageParam: undefined,
      maxPages: 1,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const locationsMap = useMemo(
    () =>
      new Map(
        locationsQuery.data?.pages.flatMap((p) =>
          p.items.map(
            (loc) => [loc.id, { name: loc.name, address: loc.address }] as const
          )
        ) ?? []
      ),
    [locationsQuery.data]
  );

  const { stops } = values;
  const isRound = values.type === 'ROUND';
  const hasInwardTimes = stops?.some((s) => s.inwardTime);
  const OnewayIcon = tripTypeIcons.ONEWAY;
  const ReturnIcon = tripTypeIcons.RETURN;

  // Cumulative day offset per stop, so a leg crossing midnight flags every
  // later time (e.g. the return departure) as happening the next day.
  // `hasDayChange` answers: does any displayed stop land on a different day?
  const dayOffsets = computeDayOffsets(stops ?? []);
  const hasDayChange = tripCrossesMidnight(stops ?? [], dayOffsets);

  const tripDate =
    tripDateProp ??
    (ns === 'commute' ? (values.date as Date | undefined) : null);

  // Shared with the form steps: when the trip crosses midnight, every stop
  // carries its exact date so the reader can tell the days apart; otherwise
  // the single global date badge is enough and stops carry no per-stop label.
  const stopDateLabel = (dayOffset: number) =>
    stopDayLabel(tripDate, dayOffset, hasDayChange, t('common:nextDay'));

  const toTimelineStop = (
    locationId: string,
    time: string,
    dayOffset: number
  ): StopForTimeline => {
    const loc = locationsMap.get(locationId);
    return {
      location: {
        id: locationId,
        name: loc?.name ?? locationId,
        address: loc?.address ?? '',
      },
      outwardTime: time,
      inwardTime: null,
      outwardDayLabel: stopDateLabel(dayOffset),
      passengers: passengersByLocationId?.get(locationId),
    };
  };

  const outwardStops = (stops ?? []).map((s, i) =>
    toTimelineStop(s.locationId, s.outwardTime, dayOffsets.outward[i] ?? 0)
  );

  const inwardStops = (stops ?? [])
    .map((s, i) => ({ s, i }))
    .reverse()
    .flatMap(({ s, i }) =>
      s.inwardTime
        ? [
            toTimelineStop(
              s.locationId,
              s.inwardTime,
              dayOffsets.inward[i] ?? 0
            ),
          ]
        : []
    );

  return (
    <div className="flex flex-col gap-4">
      {/* Meta info */}
      <div className="flex flex-wrap gap-2">
        {ns === 'commute' && tripDate != null && !hasDayChange && (
          <Badge variant="secondary">{formatTripDate(tripDate, 0)}</Badge>
        )}
        {ns === 'commuteTemplate' && values.name != null && (
          <Badge variant="secondary">{String(values.name)}</Badge>
        )}
        <Badge variant="default">
          {isRound
            ? t('commute:list.type.ROUND')
            : t('commute:list.type.ONEWAY')}
        </Badge>
        <Badge variant="secondary">
          {t('commute:list.seats', { count: values.seats })}
        </Badge>
      </div>

      {/* Trip timelines — side by side for round trips */}
      <div
        className={
          isRound && hasInwardTimes
            ? 'flex flex-col gap-4 sm:grid sm:grid-cols-2'
            : ''
        }
      >
        {/* Outbound trip */}
        <div className="flex flex-col gap-2">
          {isRound && (
            <h3 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <OnewayIcon className="size-3.5" />
              {t(`${ns}:stepper.outboundTrip`)}
            </h3>
          )}
          <div className="flex flex-col">
            {outwardStops.map((stop, index) => (
              <StopsTimelineItem
                key={stop.location.id}
                stop={stop}
                isFirst={index === 0}
                isLast={index === outwardStops.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Inbound trip (only for round trips with inward times) */}
        {isRound && hasInwardTimes && (
          <div className="flex flex-col gap-2">
            <h3 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <ReturnIcon className="size-3.5" />
              {t(`${ns}:stepper.inboundTrip`)}
            </h3>
            <div className="flex flex-col">
              {inwardStops.map((stop, index) => (
                <StopsTimelineItem
                  key={stop.location.id}
                  stop={stop}
                  isFirst={index === 0}
                  isLast={index === inwardStops.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comment */}
      {values.comment && <CommentText>{values.comment}</CommentText>}
    </div>
  );
};
