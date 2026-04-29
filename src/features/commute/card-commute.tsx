import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import { UserBookingStatus } from '@/features/booking/status-colors';
import { HeaderStopsTimeline } from '@/features/commute/header-stops-timeline';
import type { CommuteType, StopEnriched } from '@/features/commute/schema';
import { TripTime } from '@/features/commute/stops-timeline';

const cardCommuteVariants = cva('border-l-4', {
  variants: {
    bookingStatus: {
      OUTSIDER: 'border-l-neutral-400',
      DRIVER: 'border-l-secondary',
      REQUESTED: 'border-l-warning-500',
      ACCEPTED: 'border-l-positive-500',
      REFUSED: 'border-l-negative-500',
      CANCELED: 'border-l-negative-500',
    } satisfies Record<NonNullable<UserBookingStatus>, string>,
  },
  defaultVariants: {
    bookingStatus: 'OUTSIDER',
  },
});

const cardCommuteGlowVariants = cva(
  'pointer-events-none absolute -top-6 -left-6 size-28 rounded-full opacity-30 blur-2xl',
  {
    variants: {
      bookingStatus: {
        OUTSIDER: 'bg-neutral-400',
        DRIVER: 'bg-secondary',
        REQUESTED: 'bg-warning-500',
        ACCEPTED: 'bg-positive-500',
        REFUSED: 'bg-negative-500',
        CANCELED: 'bg-negative-500',
      } satisfies Record<NonNullable<UserBookingStatus>, string>,
    },
    defaultVariants: {
      bookingStatus: 'OUTSIDER',
    },
  }
);

function CardCommute({
  children,
  className,
  bookingStatus,
  ...props
}: React.ComponentProps<typeof Collapsible> &
  VariantProps<typeof cardCommuteVariants>) {
  return (
    <Collapsible data-slot="card-commute" {...props}>
      <Card
        className={cn(
          'relative gap-0 overflow-hidden',
          cardCommuteVariants({ bookingStatus }),
          className
        )}
      >
        <div className={cardCommuteGlowVariants({ bookingStatus })} />
        {children}
      </Card>
    </Collapsible>
  );
}

function CardCommuteTrigger({
  className,
  ...props
}: React.ComponentProps<typeof CollapsibleTrigger>) {
  return (
    <CollapsibleTrigger
      data-slot="card-commute-trigger"
      nativeButton={false}
      render={<CardHeader />}
      className={cn(
        'group cursor-pointer [&[data-panel-open]_.chevron-icon]:rotate-180',
        className
      )}
      {...props}
    />
  );
}

function CardCommuteContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CollapsibleContent>) {
  return (
    <CollapsibleContent
      data-slot="card-commute-content"
      keepMounted
      className={cn(
        'h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-100 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:h-0 data-open:duration-200 data-open:ease-[cubic-bezier(0.2,0,0,1)] data-starting-style:h-0',
        className
      )}
      {...props}
    >
      <CardContent className="pt-2">{children}</CardContent>
    </CollapsibleContent>
  );
}

type PassengerSummary = {
  id: string;
  name?: string | null;
  image?: string | null;
};

type CardCommuteHeaderProps = {
  driver: { name?: string | null; image?: string | null };
  type: CommuteType;
  totalSeats: number;
  outwardTaken: number;
  inwardTaken?: number;
  outwardDeparture?: string;
  inwardDeparture?: string;
  stops?: StopEnriched[];
  passengers?: PassengerSummary[];
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  renderStopActions?: (
    stopId: string,
    info: { isFirst: boolean; isLast: boolean }
  ) => React.ReactNode;
};

const MAX_VISIBLE_PASSENGERS = 3;

function TripInfo({
  type,
  time,
  seatLabel,
}: {
  type: 'ONEWAY' | 'RETURN';
  time?: string;
  seatLabel: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {time && (
        <TripTime
          type={type}
          time={time}
          timeClassName="font-medium text-foreground"
        />
      )}
      <span className="text-muted-foreground/50">·</span>
      <span className="text-xs">{seatLabel}</span>
    </span>
  );
}

function PassengersAvatarGroup({
  passengers,
  className,
}: {
  passengers: PassengerSummary[];
  className?: string;
}) {
  const overflow = passengers.length - MAX_VISIBLE_PASSENGERS;
  return (
    <AvatarGroup className={className}>
      {passengers.slice(0, MAX_VISIBLE_PASSENGERS).map((p) => (
        <Avatar key={p.id} size="sm">
          <AvatarImage src={p.image ?? undefined} />
          <AvatarFallback variant="boring" name={p.name ?? '?'} />
        </Avatar>
      ))}
      {overflow > 0 && <AvatarGroupCount>+{overflow}</AvatarGroupCount>}
    </AvatarGroup>
  );
}

function CardCommuteHeader({
  driver,
  type,
  totalSeats,
  outwardTaken,
  inwardTaken,
  outwardDeparture,
  inwardDeparture,
  stops,
  passengers,
  badge,
  actions,
  renderStopActions,
}: CardCommuteHeaderProps) {
  const { t } = useTranslation(['commute']);
  const seatLabel = (taken: number) =>
    t('commute:list.seatCount', { taken, total: totalSeats });

  return (
    <>
      <div className="flex items-center gap-3">
        <Avatar size="xl" className="rounded-sm">
          <AvatarImage src={driver.image ?? undefined} className="rounded-md" />
          <AvatarFallback variant="boring" name={driver.name ?? '?'} />
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <CardTitle className="truncate capitalize">{driver.name}</CardTitle>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" size="sm">
              {t(`commute:list.type.${type}`)}
            </Badge>
            {badge}
            {!!passengers?.length && (
              <PassengersAvatarGroup
                className="ml-auto"
                passengers={passengers}
              />
            )}
          </div>
        </div>
      </div>
      <CardAction className="row-span-1">
        <div className="flex items-center gap-1">
          {actions}
          <ChevronDown
            data-slot="card-commute-toggle"
            className="chevron-icon size-4 text-muted-foreground transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]"
          />
        </div>
      </CardAction>

      <div className="col-span-full flex flex-wrap items-center gap-x-4 gap-y-1">
        <TripInfo
          type="ONEWAY"
          time={outwardDeparture}
          seatLabel={seatLabel(outwardTaken)}
        />
        {type === 'ROUND' && (
          <TripInfo
            type="RETURN"
            time={inwardDeparture}
            seatLabel={seatLabel(inwardTaken ?? outwardTaken)}
          />
        )}
      </div>

      {!!stops?.length && (
        <HeaderStopsTimeline
          stops={stops}
          renderStopActions={renderStopActions}
        />
      )}
    </>
  );
}

export {
  CardCommute,
  CardCommuteContent,
  CardCommuteHeader,
  CardCommuteTrigger,
};
