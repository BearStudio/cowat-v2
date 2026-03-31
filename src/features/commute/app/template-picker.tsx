import { getUiState } from '@bearstudio/ui-state';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { CardCommuteStopsList } from '@/features/commute/card-commute-stops-list';
import type { FormFieldsCommute } from '@/features/commute/schema';
import { CardCommuteTemplateHeader } from '@/features/commute-template/card-commute-template-header';

type TemplateData = Pick<
  FormFieldsCommute,
  'seats' | 'type' | 'comment' | 'stops'
> & { templateName: string };

export const TemplatePicker = ({
  onSelect,
}: {
  onSelect: (data: TemplateData) => void;
}) => {
  const { t } = useTranslation(['commute', 'commuteTemplate']);

  const templatesQuery = useQuery(
    orpc.commuteTemplate.getAll.queryOptions({
      input: { limit: 100 },
    })
  );

  const handleSelect = (
    item: NonNullable<typeof templatesQuery.data>['items'][number]
  ) => {
    onSelect({
      templateName: item.name,
      seats: item.seats,
      type: item.type,
      comment: item.comment ?? null,
      stops: item.stops.map((stop) => ({
        locationId: stop.locationId,
        outwardTime: stop.outwardTime,
        inwardTime: stop.inwardTime ?? null,
      })),
    });
  };

  const ui = getUiState((set) => {
    if (templatesQuery.status === 'pending') return set('pending');
    if (templatesQuery.status === 'error') return set('error');
    const items = templatesQuery.data?.items ?? [];
    if (!items.length) return set('empty');
    return set('default', { items });
  });

  return ui
    .match('pending', () => (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">
          {t('commute:templatePicker.title')}
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[1, 0.75, 0.5].map((opacity) => (
            <Skeleton key={opacity} className="h-20" style={{ opacity }} />
          ))}
        </div>
      </div>
    ))
    .match('error', () => null)
    .match('empty', () => null)
    .match('default', ({ items }) => (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">
          {t('commute:templatePicker.title')}
        </h3>
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer"
              onClick={() => handleSelect(item)}
            >
              <CardHeader>
                <CardCommuteTemplateHeader
                  name={item.name}
                  type={item.type}
                  stopsCount={item.stops.length}
                  seats={item.seats}
                />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {item.comment && (
                    <p className="text-sm text-muted-foreground">
                      {item.comment}
                    </p>
                  )}
                  <CardCommuteStopsList
                    stops={item.stops.map((stop) => ({
                      ...stop,
                      commuteId: '',
                      passengers: [],
                    }))}
                    disableLinks
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    ))
    .exhaustive();
};
