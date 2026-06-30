import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import '@/lib/dayjs/config';

import { type DateFormatKey } from '@/lib/dayjs/formats';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import {
  type StopForTimeline,
  StopsTimelineItem,
} from '@/features/commute/stops-timeline';
import { computeStopDayLabels } from '@/features/commute/time-utils';

type ConfirmSummaryProps = {
  user?: { name?: string | null; image?: string | null };
  date: Date;
  dateFormat?: DateFormatKey;
  typeLabel: string;
  stops: StopForTimeline[];
  /**
   * Full ordered trip, used **only** to compute the per-stop day offsets when
   * `stops` is a subset (e.g. the booking drawer renders a single boarding
   * stop). A stop's day depends on the legs before it, so the offsets must be
   * computed over the whole trip. Rendered stops are matched into it by reference.
   */
  tripStops?: StopForTimeline[];
};

export const ConfirmSummary = ({
  user,
  date,
  dateFormat = 'commute:dayHeader',
  typeLabel,
  stops,
  tripStops,
}: ConfirmSummaryProps) => {
  const { t } = useTranslation(['common']);
  const offsetStops = tripStops ?? stops;
  const dayLabels = computeStopDayLabels(offsetStops, (offset) =>
    t('common:dayBadge', { count: offset })
  );
  // Each rendered stop reuses the label computed for its position in the full
  // trip. When `tripStops` is omitted, `offsetStops === stops` so this is the
  // identity mapping.
  const labelFor = (stop: StopForTimeline) => {
    const index = offsetStops.indexOf(stop);
    return index >= 0 ? dayLabels[index] : undefined;
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-3 text-left text-sm">
      <div className="flex items-center gap-3">
        {user && (
          <Avatar size="xl" className="rounded-sm">
            <AvatarImage src={user.image ?? undefined} className="rounded-md" />
            <AvatarFallback variant="boring" name={user.name ?? '?'} />
          </Avatar>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate font-medium capitalize">
            {dayjs(date).f(dateFormat)}
          </span>
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" size="sm">
              {typeLabel}
            </Badge>
            {user?.name && (
              <span className="truncate text-muted-foreground">
                {user.name}
              </span>
            )}
          </div>
        </div>
      </div>
      {stops.length > 0 && (
        <div className="border-t pt-3">
          <div className="flex flex-col">
            {stops.map((stop, i) => (
              <StopsTimelineItem
                key={stop.location.id}
                stop={{ ...stop, ...labelFor(stop) }}
                isFirst={i === 0}
                isLast={i === stops.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
