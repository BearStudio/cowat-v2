import { ExternalLinkIcon } from 'lucide-react';
import { ReactNode } from 'react';

import { tripTypeIcons } from '@/lib/feature-icons';
import { cn } from '@/lib/tailwind/utils';

import { Badge } from '@/components/ui/badge';

import { bookingStatusBadgeVariants } from '@/features/booking/booking-status-badge';
import { StopEnriched } from '@/features/commute/schema';

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

export type StopForTimeline = Pick<
  StopEnriched,
  'location' | 'outwardTime' | 'inwardTime'
> & { passengers?: StopEnriched['passengers'] };

type StopsTimelineItemProps = {
  stop: StopForTimeline;
  isFirst: boolean;
  isLast: boolean;
  actions?: ReactNode;
};

const TimelineMarker = ({
  isFirst,
  isLast,
}: {
  isFirst: boolean;
  isLast: boolean;
}) => (
  <div className="flex w-3 flex-col items-center self-stretch pt-[3px]">
    <div className="flex h-5 items-center">
      {isFirst ? (
        <div className="size-3 shrink-0 rounded-full border-2 border-primary bg-card" />
      ) : isLast ? (
        <div className="size-3 shrink-0 rounded-full bg-primary" />
      ) : (
        <div className="size-2 shrink-0 rounded-full bg-primary/50" />
      )}
    </div>
    {!isLast && <div className="w-0.5 flex-1 rounded-full bg-primary/15" />}
  </div>
);

export const StopsTimelineItem = ({
  stop,
  isFirst,
  isLast,
  actions,
}: StopsTimelineItemProps) => {
  const activePassengers = (stop.passengers ?? []).filter(
    (p) => p.status === 'REQUESTED' || p.status === 'ACCEPTED'
  );

  return (
    <div className="flex items-start gap-3">
      <TimelineMarker isFirst={isFirst} isLast={isLast} />
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-1.5',
          !isLast && 'pb-4'
        )}
      >
        <div className="-mb-1 flex items-center gap-1.5">
          <span className="truncate text-sm leading-5 font-medium">
            {stop.location.name}
          </span>
          <span className="text-muted-foreground/50">·</span>
          <div className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
            <TripTime type="ONEWAY" time={stop.outwardTime} />
            {stop.inwardTime && (
              <>
                <span className="text-muted-foreground/50">·</span>
                <TripTime type="RETURN" time={stop.inwardTime} />
              </>
            )}
          </div>
        </div>
        {stop.location.address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.location.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 truncate text-sm text-muted-foreground hover:text-foreground"
          >
            <span className="truncate">{stop.location.address}</span>
            <ExternalLinkIcon className="size-3 shrink-0" />
          </a>
        )}
        {activePassengers.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {activePassengers.map((p) => {
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
        )}
        {actions && <div className="min-w-0">{actions}</div>}
      </div>
    </div>
  );
};

type StopsTimelineProps = {
  stops: Array<StopEnriched>;
  renderActions?: (
    stop: StopEnriched,
    info: { isFirst: boolean; isLast: boolean }
  ) => ReactNode;
  className?: string;
};

export const StopsTimeline = ({
  stops,
  renderActions,
  className,
}: StopsTimelineProps) => (
  <div className={cn('flex flex-col', className)}>
    {stops.map((stop, index) => (
      <StopsTimelineItem
        key={stop.id}
        stop={stop}
        isFirst={index === 0}
        isLast={index === stops.length - 1}
        actions={renderActions?.(stop, {
          isFirst: index === 0,
          isLast: index === stops.length - 1,
        })}
      />
    ))}
  </div>
);
