import React from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

import {
  ActivePassengersBadges,
  StopDayBadge,
  StopForTimeline,
  TimelineDot,
  TimelineLine,
  TripTime,
} from '@/features/commute/stops-timeline';
import {
  computeDayOffsets,
  computeStopDayLabels,
  outwardDurationMinutes,
} from '@/features/commute/time-utils';

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

type HeaderStop = StopForTimeline & { id: string };

type StopActionsRenderer = (
  stopId: string,
  info: { isFirst: boolean; isLast: boolean }
) => React.ReactNode;

type HeaderStopsTimelineProps = {
  stops: HeaderStop[];
  renderStopActions?: StopActionsRenderer;
  /**
   * Trip date, used to label stops that fall on a later day when the trip
   * crosses midnight (e.g. a return departing after midnight).
   */
  tripDate?: Date | null;
};

/**
 * Grid-rows reveal trick: close smoothly without leaving action rows visible.
 * Open transitions match the card panel duration so the total card height
 * changes as one motion instead of jumping before the panel animation starts.
 */
const EXPAND_CLS =
  'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-100 ease-[cubic-bezier(0.32,0.72,0,1)] group-data-[panel-open]:grid-rows-[1fr] group-data-[panel-open]:opacity-100 group-data-[panel-open]:duration-200 group-data-[panel-open]:ease-[cubic-bezier(0.2,0,0,1)]';
const COLLAPSE_CLS =
  'grid grid-rows-[1fr] overflow-hidden opacity-100 transition-[grid-template-rows,opacity] duration-100 ease-[cubic-bezier(0.32,0.72,0,1)] group-data-[panel-open]:grid-rows-[0fr] group-data-[panel-open]:opacity-0 group-data-[panel-open]:duration-200 group-data-[panel-open]:ease-[cubic-bezier(0.2,0,0,1)]';

function StopNameRow({ stop }: { stop: StopForTimeline }) {
  return (
    <div className="-mb-1 flex min-w-0 items-center gap-1.5">
      <span className="min-w-0 truncate text-sm leading-5 font-medium">
        {stop.location.name}
      </span>
      {/* Horizontal grid-cols trick: collapse times to 0fr when closed so they
          reveal fluidly on open, instead of display-swapping. */}
      <div className="grid grid-cols-[0fr] opacity-0 transition-[grid-template-columns,opacity] duration-100 ease-[cubic-bezier(0.32,0.72,0,1)] group-data-[panel-open]:grid-cols-[1fr] group-data-[panel-open]:opacity-100 group-data-[panel-open]:duration-200 group-data-[panel-open]:ease-[cubic-bezier(0.2,0,0,1)]">
        <div className="flex shrink-0 items-center gap-1.5 text-sm whitespace-nowrap text-muted-foreground">
          <span className="text-muted-foreground/50">·</span>
          <TripTime type="ONEWAY" time={stop.outwardTime} />
          <StopDayBadge label={stop.outwardDayLabel} />
          {stop.inwardTime && (
            <>
              <span className="text-muted-foreground/50">·</span>
              <TripTime type="RETURN" time={stop.inwardTime} />
              <StopDayBadge label={stop.inwardDayLabel} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StopDetails({ stop }: { stop: StopForTimeline }) {
  return (
    <>
      {stop.location.address && (
        <span className="mt-1 block truncate text-sm text-muted-foreground">
          {stop.location.address}
        </span>
      )}
      <ActivePassengersBadges passengers={stop.passengers} className="pt-0.5" />
    </>
  );
}

type StopRowPosition = 'first' | 'intermediate' | 'last';

function TimelineStopRow({
  stop,
  position,
  isOnly = false,
  renderStopActions,
}: {
  stop: HeaderStop;
  position: StopRowPosition;
  isOnly?: boolean;
  renderStopActions?: StopActionsRenderer;
}) {
  const isFirst = position === 'first' || isOnly;
  const isLast = position === 'last' || isOnly;
  const stopActions = renderStopActions?.(stop.id, { isFirst, isLast });
  const details = (
    <div className="min-h-0 overflow-hidden">
      <StopDetails stop={stop} />
      {stopActions}
    </div>
  );

  return (
    <div
      className={cn(
        'relative flex items-start gap-3',
        position !== 'last' && 'pb-3'
      )}
    >
      {!isOnly && (
        <TimelineLine
          from={position === 'first' ? 'dot' : 'top'}
          to={position === 'last' ? 'dot' : 'bottom'}
        />
      )}
      <TimelineDot />
      <div className="flex min-w-0 flex-1 flex-col">
        <StopNameRow stop={stop} />
        {position === 'intermediate' ? (
          details
        ) : (
          <div className={EXPAND_CLS}>{details}</div>
        )}
      </div>
    </div>
  );
}

export function HeaderStopsTimeline({
  stops,
  renderStopActions,
  tripDate,
}: HeaderStopsTimelineProps) {
  const { t } = useTranslation(['commute', 'common']);

  // Computed once and shared between the day labels and the duration below, so
  // a leg crossing midnight is handled consistently without recomputing.
  const dayOffsets = computeDayOffsets(stops);

  // Merge per-stop day labels so a leg crossing midnight is shown next to the
  // affected times, consistently with the form recap.
  const dayLabels = computeStopDayLabels(
    stops,
    tripDate,
    t('common:nextDay'),
    dayOffsets
  );
  const labeledStops = stops.map((stop, i) => ({ ...stop, ...dayLabels[i] }));

  const firstStop = labeledStops[0];
  const lastStop = labeledStops[labeledStops.length - 1];
  if (!firstStop || !lastStop) return null;

  const isOnlyStop = labeledStops.length === 1;
  const intermediateStops =
    labeledStops.length > 2 ? labeledStops.slice(1, -1) : [];
  // Day-offset aware so an outward leg crossing midnight (e.g. 23:30 → 00:15)
  // yields a real elapsed time, not a negative raw-clock difference.
  const duration = formatDuration(outwardDurationMinutes(stops, dayOffsets));
  const connectorLabel =
    intermediateStops.length > 0
      ? `${t('commute:list.stops', { count: intermediateStops.length })} · ${duration}`
      : duration;

  return (
    <div className="col-span-full flex flex-col">
      <TimelineStopRow
        stop={firstStop}
        position="first"
        isOnly={isOnlyStop}
        renderStopActions={renderStopActions}
      />

      {!isOnlyStop && (
        <>
          {/* CONNECTOR — visible when closed, collapses when open */}
          <div className={COLLAPSE_CLS}>
            <div className="min-h-0 overflow-hidden">
              <div className="relative flex items-center gap-3 pb-3">
                <TimelineLine from="top" to="bottom" />
                <div
                  className={cn(
                    'size-1.5 shrink-0',
                    intermediateStops.length > 0 &&
                      'relative z-10 rounded-full bg-foreground'
                  )}
                />
                <span className="text-xs text-muted-foreground">
                  {connectorLabel}
                </span>
              </div>
            </div>
          </div>

          {intermediateStops.map((stop) => (
            <div key={stop.id} className={EXPAND_CLS}>
              <div className="min-h-0 overflow-hidden">
                <TimelineStopRow
                  stop={stop}
                  position="intermediate"
                  renderStopActions={renderStopActions}
                />
              </div>
            </div>
          ))}

          <TimelineStopRow
            stop={lastStop}
            position="last"
            renderStopActions={renderStopActions}
          />
        </>
      )}
    </div>
  );
}
