import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import '@/lib/dayjs/config';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import {
  type CommuteType,
  type StopEnriched,
  type UserSummary,
} from '@/features/commute/schema';
import { StopsTimeline } from '@/features/commute/stops-timeline';

type CommuteSummaryProps = {
  date: Date;
  type: CommuteType;
  stops: StopEnriched[];
  driver?: UserSummary;
};

export const CommuteSummary = ({
  date,
  type,
  stops,
  driver,
}: CommuteSummaryProps) => {
  const { t } = useTranslation(['commute']);

  return (
    <div className="flex flex-col gap-2 rounded-md border bg-muted/40 p-3 text-sm">
      <div className="flex items-center gap-2">
        {driver && (
          <Avatar size="sm">
            <AvatarImage src={driver.image ?? undefined} />
            <AvatarFallback variant="boring" name={driver.name ?? '?'} />
          </Avatar>
        )}
        <div className="flex flex-col">
          <span className="font-medium capitalize">
            {dayjs(date).f('commute:dayHeader')}
          </span>
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" size="sm" className="w-fit">
              {t(`commute:list.type.${type}`)}
            </Badge>
            {driver?.name && (
              <span className="text-muted-foreground">{driver.name}</span>
            )}
          </div>
        </div>
      </div>
      <StopsTimeline stops={stops} />
    </div>
  );
};
