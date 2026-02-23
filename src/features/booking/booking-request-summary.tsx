import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import '@/lib/dayjs/config';

import { tripTypeIcons } from '@/lib/feature-icons';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import { type BookingForDriver } from '@/features/booking/schema';

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
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center self-stretch">
          <div className="flex h-6 items-center">
            <div className="size-3 shrink-0 rounded-full bg-primary" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="leading-6 font-medium">
            {request.stop.location.name}
          </span>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1">
              <tripTypeIcons.ONEWAY className="size-3.5" />
              {request.stop.outwardTime}
            </span>
            {request.stop.inwardTime && (
              <span className="flex items-center gap-1">
                <tripTypeIcons.RETURN className="size-3.5" />
                {request.stop.inwardTime}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
