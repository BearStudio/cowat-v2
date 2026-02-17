import { cva, type VariantProps } from 'class-variance-authority';
import dayjs from 'dayjs';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  availableSeats: number;
  totalSeats: number;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
};

function CardCommuteHeader({
  driver,
  date,
  type,
  availableSeats,
  totalSeats,
  badge,
  actions,
}: CardCommuteHeaderProps) {
  const { t } = useTranslation(['commute']);

  return (
    <>
      <div className="flex items-center gap-2">
        <Avatar size="sm">
          <AvatarImage src={driver.image ?? undefined} />
          <AvatarFallback variant="boring" name={driver.name ?? '?'} />
        </Avatar>
        <CardTitle>{dayjs(date).format('DD/MM/YYYY')}</CardTitle>
        {badge}
      </div>
      <CardDescription>
        {driver.name}
        {' · '}
        {t(`commute:list.type.${type}`)}
        {' · '}
        {t('commute:list.availableSeats', {
          available: availableSeats,
          total: totalSeats,
        })}
      </CardDescription>
      <CardAction>
        <div className="flex items-center gap-1">
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
