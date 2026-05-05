import { t } from 'i18next';

import { Button } from '@/components/ui/button';

import { CommuteEnriched } from '@/features/commute/schema';
import { TripTime } from '@/features/commute/stops-timeline';

type Props = {
  commute: CommuteEnriched;
  onOpen: () => void;
};

export const UpcomingCommuteBanner = ({ commute, onOpen }: Props) => {
  const stops = [...commute.stops].sort((a, b) => a.order - b.order);
  const firstStop = stops[0];
  const lastStop = stops[stops.length - 1];

  return (
    <div className="sticky top-0 z-10 border-b bg-background/95">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {firstStop?.outwardTime && (
            <>
              <TripTime type="ONEWAY" time={firstStop.outwardTime} />
              <span className="text-sm font-medium">
                {firstStop.location?.name}
              </span>
            </>
          )}
          {lastStop?.inwardTime && (
            <>
              <span className="text-muted-foreground/50">·</span>
              <TripTime type="RETURN" time={lastStop.inwardTime} />
              <span className="text-sm font-medium">
                {lastStop.location?.name}
              </span>
            </>
          )}
        </div>
        <Button size="sm" onClick={onOpen}>
          {t('upcomingCommute:banner.display')}
        </Button>
      </div>
    </div>
  );
};
