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
      <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          {firstStop?.outwardTime && (
            <div className="flex min-w-0 items-center gap-2">
              <TripTime type="ONEWAY" time={firstStop.outwardTime} />
              <span className="truncate text-sm font-medium">
                {firstStop.location?.name}
              </span>
            </div>
          )}
          {lastStop?.inwardTime && (
            <div className="flex min-w-0 items-center gap-2">
              <span className="hidden text-muted-foreground/50 sm:inline">
                ·
              </span>
              <TripTime type="RETURN" time={lastStop.inwardTime} />
              <span className="truncate text-sm font-medium">
                {lastStop.location?.name}
              </span>
            </div>
          )}
        </div>
        <div className="flex shrink-0">
          <Button size="sm" onClick={onOpen} className="w-full sm:w-auto">
            {t('upcomingCommute:banner.display')}
          </Button>
        </div>
      </div>
    </div>
  );
};
