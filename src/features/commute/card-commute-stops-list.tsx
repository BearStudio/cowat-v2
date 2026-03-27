import { ReactNode } from 'react';

import { StopEnriched } from '@/features/commute/schema';
import { StopsTimeline } from '@/features/commute/stops-timeline';

type CardCommuteStopsListProps = {
  stops: Array<StopEnriched>;
  renderActions?: (
    stop: StopEnriched,
    info: { isFirst: boolean; isLast: boolean }
  ) => ReactNode;
  disableLinks?: boolean;
};

export const CardCommuteStopsList = ({
  stops,
  renderActions,
  disableLinks,
}: CardCommuteStopsListProps) => {
  if (stops.length === 0) return null;

  return (
    <StopsTimeline
      stops={stops}
      renderActions={renderActions}
      disableLinks={disableLinks}
      className="py-1"
    />
  );
};
