import { useTranslation } from 'react-i18next';

import { BookingRequestSummary } from '@/features/booking/booking-request-summary';
import { type BookingForDriver } from '@/features/booking/schema';

type BookingRefuseDescriptionProps = {
  request: BookingForDriver;
};

export const BookingRefuseDescription = ({
  request,
}: BookingRefuseDescriptionProps) => {
  const { t } = useTranslation(['booking']);

  return (
    <div className="flex flex-col gap-3">
      <span>{t('booking:request.refuseConfirmDescription')}</span>
      <div className="rounded-md border bg-muted/40 p-3">
        <BookingRequestSummary request={request} />
      </div>
    </div>
  );
};
