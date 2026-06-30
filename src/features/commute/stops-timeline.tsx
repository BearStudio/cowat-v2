import { ExternalLinkIcon } from 'lucide-react';
import { CSSProperties, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { tripTypeIcons } from '@/lib/feature-icons';
import { cn } from '@/lib/tailwind/utils';

import { Badge } from '@/components/ui/badge';

import { bookingStatusBadgeVariants } from '@/features/booking/booking-status-badge';
import { StopEnriched, StopPassenger } from '@/features/commute/schema';
import { computeStopDayLabels } from '@/features/commute/time-utils';

export const TripTime = ({
  type,
  time,
  timeClassName,
}: {
  type: 'ONEWAY' | 'RETURN';
  time: string;
  timeClassName?: string;
}) => {
  const Icon = tripTypeIcons[type];
  return (
    <span className="flex items-center gap-1">
      <Icon className="size-3.5 shrink-0" />
      <span className={cn('tabular-nums', timeClassName)}>{time}</span>
    </span>
  );
};

/**
 * Small secondary day badge shown next to a time on a multi-day trip.
 * Renders nothing when `label` is null/undefined. Shared by the form steps, the
 * recap and the read-only timelines so the day indicator looks identical
 * everywhere.
 *
 * On mobile the full label ("Jour J", "Lendemain", "+2 jours") would crowd the
 * time block and push the stop name out (it truncates first), so we instead
 * show a compact "+N" chip — and only for stops actually shifted to a later day
 * (the day-0 "Jour J" label is desktop-only). From `sm` up there is room for
 * the full label.
 */
export const StopDayBadge = ({
  label,
  offset,
}: {
  label?: string | null;
  offset?: number | null;
}) => {
  if (!label) return null;
  const shifted = typeof offset === 'number' && offset >= 1;
  return (
    <>
      {shifted && (
        <Badge className="sm:hidden" variant="secondary" size="xs">
          +{offset}
        </Badge>
      )}
      <Badge className="hidden sm:inline-flex" variant="secondary" size="xs">
        {label}
      </Badge>
    </>
  );
};

export type StopForTimeline = Pick<
  StopEnriched,
  'location' | 'outwardTime' | 'inwardTime'
> & {
  passengers?: StopPassenger[];
  /**
   * Relative day badge label shown on a multi-day trip (e.g. "Jour J" on the
   * trip's own day, "Lendemain", "+2 jours"). Omitted/null = single-day trip.
   */
  outwardDayLabel?: string | null;
  inwardDayLabel?: string | null;
  /** Cumulative day offset, for the compact "+N" badge shown on mobile. */
  outwardDayOffset?: number | null;
  inwardDayOffset?: number | null;
};

export const TimelineDot = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'relative z-10 mt-[7px] size-1.5 shrink-0 rounded-full bg-foreground',
      className
    )}
  />
);

/**
 * Vertical 1px line positioned over the timeline dot column.
 * `from`/`to` describe where the line starts and ends vertically within its
 * container — either the container edge ("top"/"bottom") or flush with the
 * dot ("dot", i.e. 10px from the relevant edge).
 */
export const TimelineLine = ({
  from,
  to,
  className,
}: {
  from: 'top' | 'dot';
  to: 'bottom' | 'dot';
  className?: string;
}) => (
  <div
    className={cn(
      'absolute left-[2.5px] w-px bg-foreground/70',
      from === 'top' ? 'top-0' : 'top-[10px]',
      to === 'bottom' ? 'bottom-0' : 'h-[10px]',
      className
    )}
  />
);

const isActivePassenger = (p: StopPassenger) =>
  p.status === 'REQUESTED' || p.status === 'ACCEPTED';

export const ActivePassengersBadges = ({
  passengers,
  className,
}: {
  passengers?: StopPassenger[];
  className?: string;
}) => {
  const active = (passengers ?? []).filter(isActivePassenger);
  if (active.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {active.map((p) => {
        const TripIcon = tripTypeIcons[p.tripType];
        return (
          <Badge
            key={p.id}
            variant={
              bookingStatusBadgeVariants({
                status: p.status,
              }) as React.ComponentProps<typeof Badge>['variant']
            }
            size="sm"
          >
            <TripIcon />
            {p.passenger.name}
          </Badge>
        );
      })}
    </div>
  );
};

const StopAddress = ({
  address,
  disableLink,
  className,
}: {
  address: string;
  disableLink?: boolean;
  className?: string;
}) => {
  if (disableLink) {
    return (
      <span className={cn('truncate text-sm text-muted-foreground', className)}>
        {address}
      </span>
    );
  }

  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex min-w-0 items-center gap-1 text-sm text-muted-foreground hover:text-foreground',
        className
      )}
    >
      <span className="min-w-0 truncate">{address}</span>
      <ExternalLinkIcon className="size-3 shrink-0" />
    </a>
  );
};

type StopsTimelineItemProps = {
  stop: StopForTimeline;
  isFirst: boolean;
  isLast: boolean;
  index?: number;
  actions?: ReactNode;
  disableLinks?: boolean;
};

export const StopsTimelineItem = ({
  stop,
  isFirst,
  isLast,
  index,
  actions,
  disableLinks,
}: StopsTimelineItemProps) => (
  <div
    className="relative flex items-start gap-3"
    data-slot="stop-item"
    style={{ '--stop-index': index ?? 0 } as CSSProperties}
  >
    <TimelineDot />
    {!isLast && <TimelineLine from={isFirst ? 'dot' : 'top'} to="bottom" />}
    {isLast && !isFirst && <TimelineLine from="top" to="dot" />}
    <div
      className={cn('flex min-w-0 flex-1 flex-col gap-1.5', !isLast && 'pb-4')}
    >
      <div className="-mb-1 flex flex-wrap items-center gap-1.5">
        <span className="truncate text-sm leading-5 font-medium">
          {stop.location.name}
        </span>
        <span className="text-muted-foreground/50">·</span>
        <div className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
          <TripTime type="ONEWAY" time={stop.outwardTime} />
          <StopDayBadge
            label={stop.outwardDayLabel}
            offset={stop.outwardDayOffset}
          />
          {stop.inwardTime && (
            <>
              <span className="text-muted-foreground/50">·</span>
              <TripTime type="RETURN" time={stop.inwardTime} />
              <StopDayBadge
                label={stop.inwardDayLabel}
                offset={stop.inwardDayOffset}
              />
            </>
          )}
        </div>
      </div>
      {stop.location.address && (
        <StopAddress
          address={stop.location.address}
          disableLink={disableLinks}
        />
      )}
      <ActivePassengersBadges passengers={stop.passengers} />
      {actions && <div className="min-w-0">{actions}</div>}
    </div>
  </div>
);

type StopsTimelineProps = {
  stops: Array<StopEnriched>;
  renderActions?: (
    stop: StopEnriched,
    info: { isFirst: boolean; isLast: boolean }
  ) => ReactNode;
  className?: string;
  disableLinks?: boolean;
};

export const StopsTimeline = ({
  stops,
  renderActions,
  className,
  disableLinks,
}: StopsTimelineProps) => {
  const { t } = useTranslation(['common']);
  // Crossed stops show a relative day badge ("Lendemain", "+2 jours").
  const dayLabels = computeStopDayLabels(stops, (offset) =>
    t('common:dayBadge', { count: offset })
  );

  return (
    <div className={cn('flex flex-col', className)}>
      {stops.map((stop, index) => {
        const isFirst = index === 0;
        const isLast = index === stops.length - 1;
        return (
          <StopsTimelineItem
            key={stop.id}
            stop={{ ...stop, ...dayLabels[index] }}
            index={index}
            isFirst={isFirst}
            isLast={isLast}
            disableLinks={disableLinks}
            actions={renderActions?.(stop, { isFirst, isLast })}
          />
        );
      })}
    </div>
  );
};
