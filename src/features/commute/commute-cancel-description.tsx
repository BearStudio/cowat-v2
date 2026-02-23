import { useTranslation } from 'react-i18next';

import { type CommuteType, type StopEnriched } from '@/features/commute/schema';
import { CommuteSummary } from '@/features/commute/commute-summary';

type CommuteCancelDescriptionProps = {
  date: Date;
  type: CommuteType;
  stops: StopEnriched[];
  hasPassengers: boolean;
};

export const CommuteCancelDescription = ({
  date,
  type,
  stops,
  hasPassengers,
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
      <CommuteSummary date={date} type={type} stops={stops} />
    </div>
  );
};
