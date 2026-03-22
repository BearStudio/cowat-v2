import { cva, type VariantProps } from 'class-variance-authority';
import dayjs from 'dayjs';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '@/lib/dayjs/config';

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
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import { UserBookingStatus } from '@/features/booking/status-colors';
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
          'relative overflow-hidden',
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
        'cursor-pointer [&[data-panel-open]_.chevron-icon]:rotate-180',
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
        'h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[height] data-ending-style:h-0 data-starting-style:h-0',
        className
      )}
      {...props}
    >
      <CardContent>{children}</CardContent>
    </CollapsibleContent>
  );
}

type CardCommuteHeaderProps = {
  driver: { name?: string | null; image?: string | null };
  date: Date;
  type: 'ROUND' | 'ONEWAY';
  totalSeats: number;
  outwardTaken: number;
  inwardTaken?: number;
  outwardDeparture?: string;
  inwardDeparture?: string;
  passengers?: Array<{
    id: string;
    name?: string | null;
    image?: string | null;
  }>;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
};

const MAX_VISIBLE_PASSENGERS = 4;

function CardCommuteHeader({
  driver,
  date,
  type,
  totalSeats,
  outwardTaken,
  inwardTaken,
  outwardDeparture,
  inwardDeparture,
  passengers,
  badge,
  actions,
}: CardCommuteHeaderProps) {
  const { t } = useTranslation(['commute']);

  const seatLabel = (taken: number) =>
    t('commute:list.seatCount', { taken, total: totalSeats });

  const TripInfo = ({
    type,
    time,
    taken,
  }: {
    type: 'ONEWAY' | 'RETURN';
    time?: string;
    taken: number;
  }) => (
    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {time && (
        <TripTime
          type={type}
          time={time}
          timeClassName="font-medium text-foreground"
        />
      )}
      <span className="text-muted-foreground/50">·</span>
      <span className="text-xs">{seatLabel(taken)}</span>
    </span>
  );

  return (
    <>
      <div className="flex items-center gap-3">
        <Avatar size="xl" className="rounded-sm">
          <AvatarImage src={driver.image ?? undefined} className="rounded-md" />
          <AvatarFallback variant="boring" name={driver.name ?? '?'} />
        </Avatar>
        <div className="flex min-w-0 flex-col gap-0.5">
          <CardTitle className="truncate capitalize">
            {dayjs(date).f('commute:dayHeader')}
          </CardTitle>
          <CardDescription className="truncate">{driver.name}</CardDescription>
        </div>
      </div>
      <CardAction className="row-span-1">
        <div className="flex items-center gap-1">
          {actions}
          <ChevronDown className="chevron-icon size-4 text-muted-foreground transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]" />
        </div>
      </CardAction>

      <div className="col-span-full flex items-center gap-2">
        <Badge variant="secondary" size="sm">
          {t(`commute:list.type.${type}`)}
        </Badge>
        {badge}
        {!!passengers?.length && (
          <AvatarGroup className="ml-auto">
            {passengers.slice(0, MAX_VISIBLE_PASSENGERS).map((p) => (
              <Avatar key={p.id} size="sm">
                <AvatarImage src={p.image ?? undefined} />
                <AvatarFallback variant="boring" name={p.name ?? '?'} />
              </Avatar>
            ))}
            {passengers.length > MAX_VISIBLE_PASSENGERS && (
              <AvatarGroupCount>
                +{passengers.length - MAX_VISIBLE_PASSENGERS}
              </AvatarGroupCount>
            )}
          </AvatarGroup>
        )}
      </div>

      <div className="col-span-full flex flex-wrap items-center gap-x-4 gap-y-1">
        <TripInfo type="ONEWAY" time={outwardDeparture} taken={outwardTaken} />
        {type === 'ROUND' && (
          <TripInfo
            type="RETURN"
            time={inwardDeparture}
            taken={inwardTaken ?? outwardTaken}
          />
        )}
      </div>
    </>
  );
}

export {
  CardCommute,
  CardCommuteContent,
  CardCommuteHeader,
  CardCommuteTrigger,
  cardCommuteVariants,
};
