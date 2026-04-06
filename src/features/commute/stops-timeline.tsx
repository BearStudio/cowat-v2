import { ExternalLinkIcon } from 'lucide-react';
import { CSSProperties, ReactNode } from 'react';

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
  index?: number;
  actions?: ReactNode;
  disableLinks?: boolean;
};

export const TimelineDot = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'relative z-10 mt-[7px] size-1.5 shrink-0 rounded-full bg-foreground/70',
      className
    )}
  />
);

export const StopsTimelineItem = ({
  stop,
  isFirst,
  isLast,
  index,
  actions,
  disableLinks,
}: StopsTimelineItemProps) => {
  const activePassengers = (stop.passengers ?? []).filter(
    (p) => p.status === 'REQUESTED' || p.status === 'ACCEPTED'
  );

  return (
    <div
      className="relative flex items-start gap-3"
      data-slot="stop-item"
      style={{ '--stop-index': index ?? 0 } as CSSProperties}
    >
      <TimelineDot />
      {/* Line going down from dot */}
      {!isLast && (
        <div
          className={cn(
            'absolute bottom-0 left-[2px] w-px bg-foreground/70',
            isFirst ? 'top-[10px]' : 'top-0'
          )}
        />
      )}
      {/* Line coming up to dot (last item) */}
      {isLast && !isFirst && (
        <div className="absolute top-0 left-[2px] h-[10px] w-px bg-foreground/70" />
      )}
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
        {stop.location.address &&
          (disableLinks ? (
            <span className="truncate text-sm text-muted-foreground">
              {stop.location.address}
            </span>
          ) : (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.location.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <span className="truncate">{stop.location.address}</span>
              <ExternalLinkIcon className="size-3 shrink-0" />
            </a>
          ))}
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
  disableLinks?: boolean;
};

export const StopsTimeline = ({
  stops,
  renderActions,
  className,
  disableLinks,
}: StopsTimelineProps) => (
  <div className={cn('flex flex-col', className)}>
    {stops.map((stop, index) => (
      <StopsTimelineItem
        key={stop.id}
        stop={stop}
        index={index}
        isFirst={index === 0}
        isLast={index === stops.length - 1}
        disableLinks={disableLinks}
        actions={renderActions?.(stop, {
          isFirst: index === 0,
          isLast: index === stops.length - 1,
        })}
      />
    ))}
  </div>
);
