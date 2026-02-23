import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import '@/lib/dayjs/config';

import { Badge } from '@/components/ui/badge';

import { type CommuteType, type StopEnriched } from '@/features/commute/schema';
import { StopsTimeline } from '@/features/commute/stops-timeline';

type CommuteSummaryProps = {
  date: Date;
  type: CommuteType;
  stops: StopEnriched[];
};

export const CommuteSummary = ({ date, type, stops }: CommuteSummaryProps) => {
  const { t } = useTranslation(['commute']);

  return (
    <div className="rounded-md border bg-muted/40 p-3 text-sm">
      <div className="mb-2 flex items-center gap-2">
        <span className="font-medium capitalize">
          {dayjs(date).f('commute:dayHeader')}
        </span>
        <Badge variant="secondary" size="sm">
          {t(`commute:list.type.${type}`)}
        </Badge>
      </div>
      <StopsTimeline stops={stops} />
    </div>
  );
};
