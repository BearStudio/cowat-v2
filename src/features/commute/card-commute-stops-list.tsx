import { ReactNode } from 'react';

import { StopEnriched } from '@/features/commute/schema';
import { StopsTimeline } from '@/features/commute/stops-timeline';

type CardCommuteStopsListProps = {
  stops: Array<StopEnriched>;
  renderActions?: (stop: StopEnriched) => ReactNode;
};

export const CardCommuteStopsList = ({
  stops,
  renderActions,
}: CardCommuteStopsListProps) => {
  if (stops.length === 0) return null;

  return (
    <StopsTimeline
      stops={stops}
      renderActions={renderActions}
      className="py-1"
    />
  );
};
