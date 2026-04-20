import dayjs from 'dayjs';
import '@/lib/dayjs/config';

import { type DateFormatKey } from '@/lib/dayjs/formats';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import {
  type StopForTimeline,
  StopsTimelineItem,
} from '@/features/commute/stops-timeline';

type ConfirmSummaryProps = {
  user?: { name?: string | null; image?: string | null };
  date: Date;
  dateFormat?: DateFormatKey;
  typeLabel: string;
  stops: StopForTimeline[];
};

export const ConfirmSummary = ({
  user,
  date,
  dateFormat = 'commute:dayHeader',
  typeLabel,
  stops,
}: ConfirmSummaryProps) => {
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
                stop={stop}
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
