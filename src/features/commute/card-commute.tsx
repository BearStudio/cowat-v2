import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import dayjs from 'dayjs';

import '@/lib/dayjs/config';
import { tripTypeIcons } from '@/lib/feature-icons';
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

const cardCommuteVariants = cva('border-l-4', {
  variants: {
    bookingStatus: {
      OUTSIDER: 'border-l-neutral-400',
      DRIVER: 'border-l-secondary',
      REQUESTED: 'border-l-primary',
      ACCEPTED: 'border-l-positive-500',
      REFUSED: 'border-l-negative-500',
      CANCELED: 'border-l-warning-500',
    } satisfies Record<NonNullable<UserBookingStatus>, string>,
  },
  defaultVariants: {
    bookingStatus: 'OUTSIDER',
  },
});

const cardCommuteGlowVariants = cva(
  'pointer-events-none absolute -top-6 -right-6 size-24 rounded-full opacity-20 blur-2xl',
  {
    variants: {
      bookingStatus: {
        OUTSIDER: 'bg-neutral-400',
        DRIVER: 'bg-secondary',
        REQUESTED: 'bg-primary',
        ACCEPTED: 'bg-positive-500',
        REFUSED: 'bg-negative-500',
        CANCELED: 'bg-warning-500',
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
      className={cn(
        'overflow-hidden transition-all data-ending-style:h-0 data-starting-style:h-0',
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
  outwardAvailable: number;
  inwardAvailable?: number;
  outwardDeparture?: string;
  inwardDeparture?: string;
  passengers?: Array<{ name?: string | null; image?: string | null }>;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
};

const MAX_VISIBLE_PASSENGERS = 4;

function CardCommuteHeader({
  driver,
  date,
  type,
  totalSeats,
  outwardAvailable,
  inwardAvailable,
  outwardDeparture,
  inwardDeparture,
  passengers,
  badge,
  actions,
}: CardCommuteHeaderProps) {
  const { t } = useTranslation(['commute']);

  const seatLabel = (available: number) =>
    t('commute:list.seatCount', { available, total: totalSeats });

  return (
    <>
      <div className="flex items-start gap-2">
        <Avatar size="xl" className="rounded-sm">
          <AvatarImage src={driver.image ?? undefined} className="rounded-md" />
          <AvatarFallback variant="boring" name={driver.name ?? '?'} />
        </Avatar>
        <div className="flex flex-col gap-0.5">
          <CardTitle className="capitalize">
            {dayjs(date).f('commute:dayHeader')}
          </CardTitle>

          <CardDescription>{driver.name}</CardDescription>
        </div>
      </div>
      <CardAction className="row-span-1">
        <div className="flex items-center gap-1">
          {actions}
          <ChevronDown className="chevron-icon size-4 text-muted-foreground transition-transform" />
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
              <Avatar key={p.name} size="sm">
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
      <div className="col-span-full flex items-center gap-2 text-sm text-muted-foreground">
        {type === 'ROUND' ? (
          <>
            <span className="flex items-center gap-0.5">
              <tripTypeIcons.ONEWAY className="size-3" />
              {outwardDeparture}
              <span className="text-muted-foreground/60">·</span>
              {seatLabel(outwardAvailable)}
            </span>
            <span className="flex items-center gap-0.5">
              <tripTypeIcons.RETURN className="size-3" />
              {inwardDeparture}
              <span className="text-muted-foreground/60">·</span>
              {seatLabel(inwardAvailable ?? outwardAvailable)}
            </span>
          </>
        ) : (
          <span className="flex items-center gap-0.5">
            {outwardDeparture}
            <span className="text-muted-foreground/60">·</span>
            {seatLabel(outwardAvailable)}
          </span>
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
