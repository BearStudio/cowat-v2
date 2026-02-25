import { useTranslation } from 'react-i18next';

import { CommuteSummary } from '@/features/commute/commute-summary';
import {
  type CommuteType,
  type StopEnriched,
  type UserSummary,
} from '@/features/commute/schema';

type CommuteCancelDescriptionProps = {
  date: Date;
  type: CommuteType;
  stops: StopEnriched[];
  hasPassengers: boolean;
  driver: UserSummary;
};

export const CommuteCancelDescription = ({
  date,
  type,
  stops,
  hasPassengers,
  driver,
}: CommuteCancelDescriptionProps) => {
  const { t } = useTranslation(['commute']);

  return (
    <div className="flex flex-col gap-3">
      <span>
        {t(
          hasPassengers
            ? 'commute:list.cancelConfirmDescriptionWithPassengers'
            : 'commute:list.cancelConfirmDescription'
        )}
      </span>
      <CommuteSummary date={date} type={type} stops={stops} driver={driver} />
    </div>
  );
};
