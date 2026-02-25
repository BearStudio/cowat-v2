import { useTranslation } from 'react-i18next';

import { CommuteSummary } from '@/features/commute/commute-summary';
import {
  type CommuteType,
  type StopEnriched,
  type UserSummary,
} from '@/features/commute/schema';

type BookingCancelDescriptionProps = {
  date: Date;
  type: CommuteType;
  stop: StopEnriched;
  driver: UserSummary;
};

export const BookingCancelDescription = ({
  date,
  type,
  stop,
  driver,
}: BookingCancelDescriptionProps) => {
  const { t } = useTranslation(['dashboard']);

  return (
    <div className="flex flex-col gap-3">
      <span>{t('dashboard:cancelBooking.confirmDescription')}</span>
      <CommuteSummary date={date} type={type} stops={[stop]} driver={driver} />
    </div>
  );
};
