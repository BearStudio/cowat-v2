import { useInfiniteQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Control, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { tripTypeIcons } from '@/lib/feature-icons';
import { orpc } from '@/lib/orpc/client';

import { Badge } from '@/components/ui/badge';

type StepRecapProps = {
  control: Control<TODO>;
  ns: 'commute' | 'commuteTemplate';
};

export const StepRecap = ({ control, ns }: StepRecapProps) => {
  const { t } = useTranslation([ns, 'commute']);
  const values = useWatch({ control });

  const locationsQuery = useInfiniteQuery(
    orpc.location.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({ cursor, limit: 100 }),
      initialPageParam: undefined,
      maxPages: 1,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const locationsMap = new Map(
    locationsQuery.data?.pages
      .flatMap((p) => p.items)
      .map((loc) => [loc.id, loc.name]) ?? []
  );

  const stops = values.stops as
    | Array<{
        locationId: string;
        outwardTime: string;
        inwardTime: string | null;
      }>
    | undefined;

  const isRound = values.type === 'ROUND';
  const hasInwardTimes = stops?.some((s) => s.inwardTime);
  const OnewayIcon = tripTypeIcons.ONEWAY;
  const ReturnIcon = tripTypeIcons.RETURN;

  return (
    <div className="flex flex-col gap-4">
      {/* Meta info */}
      <div className="flex flex-wrap gap-2">
        {ns === 'commute' && values.date && (
          <Badge variant="secondary">
            {dayjs(values.date as Date).format('DD/MM/YYYY')}
          </Badge>
        )}
        {ns === 'commuteTemplate' && values.name && (
          <Badge variant="secondary">{values.name as string}</Badge>
        )}
        <Badge variant="default">
          {isRound
            ? t('commute:list.type.ROUND')
            : t('commute:list.type.ONEWAY')}
        </Badge>
        <Badge variant="secondary">
          {t('commute:list.seats', { count: values.seats as number })}
        </Badge>
      </div>

      {/* Outbound trip */}
      <div className="flex flex-col gap-2">
        {isRound && (
          <h3 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <OnewayIcon className="size-3.5" />
            {t(`${ns}:stepper.outboundTrip`)}
          </h3>
        )}
        <div className="flex flex-col">
          {stops?.map((stop, index) => {
            const isLast = index === (stops.length ?? 0) - 1;
            return (
              <div key={index} className="flex items-start gap-4">
                <div className="flex flex-col items-center self-stretch">
                  <div className="flex h-6 items-center">
                    <div className="size-3 shrink-0 rounded-full bg-primary" />
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-border" />}
                </div>
                <div
                  className={`flex min-w-0 flex-1 flex-col gap-1.5 ${isLast ? '' : 'pb-4'}`}
                >
                  <span className="truncate text-base leading-6 font-medium">
                    {locationsMap.get(stop.locationId) ?? stop.locationId}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {stop.outwardTime}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inbound trip (only for round trips with inward times) */}
      {isRound && hasInwardTimes && (
        <div className="flex flex-col gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <ReturnIcon className="size-3.5" />
            {t(`${ns}:stepper.inboundTrip`)}
          </h3>
          <div className="flex flex-col">
            {[...(stops ?? [])]
              .reverse()
              .filter((stop) => stop.inwardTime)
              .map((stop, index, arr) => {
                const isLast = index === arr.length - 1;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex flex-col items-center self-stretch">
                      <div className="flex h-6 items-center">
                        <div className="size-3 shrink-0 rounded-full bg-primary" />
                      </div>
                      {!isLast && <div className="w-px flex-1 bg-border" />}
                    </div>
                    <div
                      className={`flex min-w-0 flex-1 flex-col gap-1.5 ${isLast ? '' : 'pb-4'}`}
                    >
                      <span className="truncate text-base leading-6 font-medium">
                        {locationsMap.get(stop.locationId) ?? stop.locationId}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {stop.inwardTime}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Comment */}
      {values.comment && (
        <p className="text-sm text-muted-foreground">
          {values.comment as string}
        </p>
      )}
    </div>
  );
};
