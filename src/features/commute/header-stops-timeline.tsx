import React from 'react';
import { useTranslation } from 'react-i18next';

import { tripTypeIcons } from '@/lib/feature-icons';

import { Badge } from '@/components/ui/badge';

import { bookingStatusBadgeVariants } from '@/features/booking/booking-status-badge';
import { TimelineDot, TripTime } from '@/features/commute/stops-timeline';

export type MiniStop = {
  id: string;
  location: { name: string; address: string };
  outwardTime: string;
  inwardTime?: string | null;
  passengers?: Array<{
    id: string;
    status: string;
    tripType: string;
    passenger: { name?: string | null };
  }>;
};

function parseMins(time: string) {
  const parts = time.split(':');
  return Number(parts[0] ?? 0) * 60 + Number(parts[1] ?? 0);
}

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

type HeaderStopsTimelineProps = {
  stops: MiniStop[];
  renderStopActions?: (
    stopId: string,
    info: { isFirst: boolean; isLast: boolean }
  ) => React.ReactNode;
};

const EXPAND_CLS =
  'grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] group-data-[panel-open]:grid-rows-[1fr]';

const COLLAPSE_CLS =
  'grid grid-rows-[1fr] overflow-hidden transition-[grid-template-rows] duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] group-data-[panel-open]:grid-rows-[0fr]';

function getActivePassengers(stop: MiniStop) {
  return (stop.passengers ?? []).filter(
    (p) => p.status === 'REQUESTED' || p.status === 'ACCEPTED'
  );
}

function StopDetails({ stop }: { stop: MiniStop }) {
  const active = getActivePassengers(stop);
  return (
    <>
      {stop.location.address && (
        <span className="mt-1 block truncate text-sm text-muted-foreground">
          {stop.location.address}
        </span>
      )}
      {active.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {active.map((p) => {
            const TripIcon =
              tripTypeIcons[p.tripType as keyof typeof tripTypeIcons];
            return (
              <Badge
                key={p.id}
                variant={
                  bookingStatusBadgeVariants({
                    status: p.status as
                      | 'DRIVER'
                      | 'REQUESTED'
                      | 'ACCEPTED'
                      | 'REFUSED'
                      | 'CANCELED',
                  }) as React.ComponentProps<typeof Badge>['variant']
                }
                size="sm"
              >
                {TripIcon && <TripIcon />}
                {p.passenger.name}
              </Badge>
            );
          })}
        </div>
      )}
    </>
  );
}

function StopNameRow({ stop }: { stop: MiniStop }) {
  return (
    <div className="-mb-1 flex items-center gap-1.5">
      <span className="truncate text-sm leading-5 font-medium">
        {stop.location.name}
      </span>
      <div className="hidden shrink-0 items-center gap-1.5 text-sm text-muted-foreground group-data-[panel-open]:flex">
        <span className="text-muted-foreground/50">·</span>
        <TripTime type="ONEWAY" time={stop.outwardTime} />
        {stop.inwardTime && (
          <>
            <span className="text-muted-foreground/50">·</span>
            <TripTime type="RETURN" time={stop.inwardTime} />
          </>
        )}
      </div>
    </div>
  );
}

export function HeaderStopsTimeline({
  stops,
  renderStopActions,
}: HeaderStopsTimelineProps) {
  const { t } = useTranslation(['commute']);

  const firstStop = stops[0];
  const lastStop = stops[stops.length - 1];
  if (!firstStop || !lastStop) return null;

  const intermediateStops = stops.length > 2 ? stops.slice(1, -1) : [];
  const duration = formatDuration(
    parseMins(lastStop.outwardTime) - parseMins(firstStop.outwardTime)
  );
  const connectorLabel =
    intermediateStops.length > 0
      ? `${t('commute:list.stops', { count: intermediateStops.length })} · ${duration}`
      : duration;

  return (
    <div className="col-span-full flex flex-col">
      {/* FIRST STOP */}
      <div className="relative flex items-start gap-3 pb-3">
        {stops.length > 1 && (
          <div className="absolute top-[10px] bottom-0 left-[2px] w-px bg-foreground/70" />
        )}
        <TimelineDot />
        <div className="flex min-w-0 flex-1 flex-col">
          <StopNameRow stop={firstStop} />
          <div className={EXPAND_CLS}>
            <div className="min-h-0 overflow-hidden">
              <StopDetails stop={firstStop} />
              {renderStopActions?.(firstStop.id, {
                isFirst: true,
                isLast: stops.length === 1,
              })}
            </div>
          </div>
        </div>
      </div>

      {stops.length > 1 && (
        <>
          {/* CONNECTOR — visible when closed, collapses when open */}
          <div className={COLLAPSE_CLS}>
            <div className="min-h-0 overflow-hidden">
              <div className="relative flex items-center gap-3 pb-3">
                <div className="absolute top-0 bottom-0 left-[2px] w-px bg-foreground/70" />
                {intermediateStops.length > 0 ? (
                  <div className="relative z-10 size-1.5 shrink-0 rounded-full bg-foreground/70" />
                ) : (
                  <div className="size-1.5 shrink-0" />
                )}
                <span className="text-xs text-muted-foreground">
                  {connectorLabel}
                </span>
              </div>
            </div>
          </div>

          {/* INTERMEDIATE STOPS */}
          {intermediateStops.map((stop) => (
            <div key={stop.id} className={EXPAND_CLS}>
              <div className="min-h-0 overflow-hidden">
                <div className="relative flex items-start gap-3 pb-3">
                  <div className="absolute top-0 bottom-0 left-[2px] w-px bg-foreground/70" />
                  <TimelineDot />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <StopNameRow stop={stop} />
                    <StopDetails stop={stop} />
                    {renderStopActions?.(stop.id, {
                      isFirst: false,
                      isLast: false,
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* LAST STOP */}
          <div className="relative flex items-start gap-3">
            <div className="absolute top-0 left-[2px] h-[10px] w-px bg-foreground/70" />
            <TimelineDot />
            <div className="flex min-w-0 flex-1 flex-col">
              <StopNameRow stop={lastStop} />
              <div className={EXPAND_CLS}>
                <div className="min-h-0 overflow-hidden">
                  <StopDetails stop={lastStop} />
                  {renderStopActions?.(lastStop.id, {
                    isFirst: false,
                    isLast: true,
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
