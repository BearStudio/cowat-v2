import { ReactNode } from 'react';

import { tripTypeIcons } from '@/lib/feature-icons';
import { cn } from '@/lib/tailwind/utils';

import { Badge } from '@/components/ui/badge';

import { bookingStatusBadgeVariants } from '@/features/booking/booking-status-badge';
import { StopEnriched } from '@/features/commute/schema';

export type StopForTimeline = Pick<
  StopEnriched,
  'location' | 'outwardTime' | 'inwardTime'
> & { passengers?: StopEnriched['passengers'] };

type StopsTimelineItemProps = {
  stop: StopForTimeline;
  isLast: boolean;
  actions?: ReactNode;
};

const TimelineMarker = ({ isLast }: { isLast?: boolean }) => (
  <div className="flex flex-col items-center self-stretch">
    <div className="flex h-6 items-center">
      <div className="size-3 shrink-0 rounded-full bg-primary" />
    </div>
    {!isLast && <div className="w-px flex-1 bg-border" />}
  </div>
);

export const StopsTimelineItem = ({
  stop,
  isLast,
  actions,
}: StopsTimelineItemProps) => {
  const activePassengers = (stop.passengers ?? []).filter(
    (p) => p.status === 'REQUESTED' || p.status === 'ACCEPTED'
  );

  return (
    <div className="flex items-start gap-4">
      <TimelineMarker isLast={isLast} />
      <div
        className={`flex min-w-0 flex-1 flex-col gap-1.5 ${isLast ? '' : 'pb-4'}`}
      >
        <span className="truncate text-base leading-3 font-medium">
          {stop.location.name}
        </span>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <tripTypeIcons.ONEWAY className="size-3.5" />
            {stop.outwardTime}
          </span>
          {stop.inwardTime && (
            <span className="flex items-center gap-1">
              <tripTypeIcons.RETURN className="size-3.5" />
              {stop.inwardTime}
            </span>
          )}
        </div>
        {activePassengers.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
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
        {actions}
      </div>
    </div>
  );
};

type StopsTimelineProps = {
  stops: Array<StopEnriched>;
  renderActions?: (stop: StopEnriched) => ReactNode;
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
        isLast={index === stops.length - 1}
        actions={renderActions?.(stop)}
      />
    ))}
  </div>
);
