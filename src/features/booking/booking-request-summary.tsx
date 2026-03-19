import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import '@/lib/dayjs/config';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import { type BookingForDriver } from '@/features/booking/schema';
import { StopsTimelineItem } from '@/features/commute/stops-timeline';

type BookingRequestSummaryProps = {
  request: BookingForDriver;
  avatarSize?: 'sm' | 'lg';
};

export const BookingRequestSummary = ({
  request,
  avatarSize = 'sm',
}: BookingRequestSummaryProps) => {
  const { t } = useTranslation(['booking']);

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-start gap-2">
        <Avatar size={avatarSize}>
          <AvatarImage src={request.passenger.image ?? undefined} />
          <AvatarFallback
            variant="boring"
            name={request.passenger.name ?? '?'}
          />
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium capitalize">
            {dayjs(request.stop.commute.date).f('booking:requestDateFull')}
          </span>
          <Badge variant="secondary" size="sm" className="w-fit self-start">
            {t(`booking:request.tripType.${request.tripType}`)}
          </Badge>
        </div>
      </div>
      <StopsTimelineItem stop={request.stop} isLast />
    </div>
  );
};
