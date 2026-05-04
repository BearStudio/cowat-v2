import { t } from 'i18next';

import { tripTypeIcons } from '@/lib/feature-icons';

import { Button } from '@/components/ui/button';

import { CommuteEnriched } from '@/features/commute/schema';

type Props = {
  commute: CommuteEnriched;
  onOpen: () => void;
};

export const UpcomingCommuteBanner = ({ commute, onOpen }: Props) => {
  const stops = [...commute.stops].sort((a, b) => a.order - b.order);
  const firstStop = stops[0];
  const lastStop = stops[stops.length - 1];
  const Icon = tripTypeIcons[commute.type];

  return (
    <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75 [animation-duration:1.5s]" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <Icon className="size-3.5 shrink-0" />
          <span className="text-sm font-medium">{firstStop?.outwardTime}</span>
          <span className="text-sm">{firstStop?.location?.name}</span>
          <Icon className="size-3.5 shrink-0" />
          <span className="text-sm font-medium">{lastStop?.inwardTime}</span>
          <span className="text-sm">{lastStop?.location?.name}</span>
        </div>
        <Button size="sm" onClick={onOpen}>
          {t('upcomingCommute:banner.display')}
        </Button>
      </div>
    </div>
  );
};
