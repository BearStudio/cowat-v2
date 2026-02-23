import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import '@/lib/dayjs/config';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import { type BookingForDriver } from '@/features/booking/schema';
import { StopsTimelineItem } from '@/features/commute/stops-timeline';

type BookingRequestSummaryProps = {
  request: BookingForDriver;
};

export const BookingRequestSummary = ({
  request,
}: BookingRequestSummaryProps) => {
  const { t } = useTranslation(['booking']);

  return (
    <div className="rounded-md border bg-muted/40 p-3 text-sm">
      <div className="mb-2 flex items-center gap-2">
        <Avatar size="sm">
          <AvatarImage src={request.passenger.image ?? undefined} />
          <AvatarFallback
            variant="boring"
            name={request.passenger.name ?? '?'}
          />
        </Avatar>
        <span className="font-medium capitalize">
          {dayjs(request.stop.commute.date).f('booking:requestDateFull')}
        </span>
        <Badge variant="secondary" size="sm">
          {t(`booking:request.tripType.${request.tripType}`)}
        </Badge>
      </div>
      <StopsTimelineItem stop={request.stop} isLast />
    </div>
  );
};
