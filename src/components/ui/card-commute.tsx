import dayjs from 'dayjs';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

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

function CardCommute({
  children,
  ...props
}: React.ComponentProps<typeof Collapsible>) {
  return (
    <Collapsible data-slot="card-commute" {...props}>
      <Card>{children}</Card>
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
        'overflow-hidden transition-all data-[ending-style]:h-0 data-[starting-style]:h-0',
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
  status: 'UNKNOWN' | 'ON_TIME' | 'DELAYED';
  type: 'ROUND' | 'ONEWAY';
  availableSeats: number;
  totalSeats: number;
  actions?: React.ReactNode;
};

function CardCommuteHeader({
  driver,
  date,
  status,
  type,
  availableSeats,
  totalSeats,
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
        <Badge
          variant={match(status)
            .returnType<'positive' | 'warning' | 'secondary'>()
            .with('ON_TIME', () => 'positive')
            .with('DELAYED', () => 'warning')
            .otherwise(() => 'secondary')}
          size="sm"
        >
          {status}
        </Badge>
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
};
