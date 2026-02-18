import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowDownLeft, ArrowUpRight, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatDate } from '@/lib/dayjs/formats';

import { cn } from '@/lib/tailwind/utils';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  badge?: React.ReactNode;
  actions?: React.ReactNode;
};

function CardCommuteHeader({
  driver,
  date,
  type,
  totalSeats,
  outwardAvailable,
  inwardAvailable,
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
          <div className="flex items-center gap-2">
            <CardTitle className="capitalize">
              {formatDate(date, 'commute:dayHeader')}
            </CardTitle>
            <Badge variant="secondary" size="sm">
              {t(`commute:list.type.${type}`)}
            </Badge>
          </div>
          <CardDescription>{driver.name}</CardDescription>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {type === 'ROUND' ? (
          <>
            <span className="flex items-center gap-0.5">
              <ArrowUpRight className="size-3" />
              {seatLabel(outwardAvailable)}
            </span>
            <span className="flex items-center gap-0.5">
              <ArrowDownLeft className="size-3" />
              {seatLabel(inwardAvailable ?? outwardAvailable)}
            </span>
          </>
        ) : (
          <span>{seatLabel(outwardAvailable)}</span>
        )}
      </div>
      <CardAction>
        <div className="flex items-center gap-1">
          {badge}
          {actions}
          <ChevronDown className="chevron-icon size-4 text-muted-foreground transition-transform" />
        </div>
      </CardAction>
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
