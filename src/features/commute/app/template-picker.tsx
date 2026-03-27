import { getUiState } from '@bearstudio/ui-state';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { featureIcons } from '@/lib/feature-icons';
import { orpc } from '@/lib/orpc/client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';

import { CardCommuteStopsList } from '@/features/commute/card-commute-stops-list';
import type { FormFieldsCommute } from '@/features/commute/schema';
import { CardCommuteTemplateHeader } from '@/features/commute-template/card-commute-template-header';
import { OrgButtonLink } from '@/features/organization/org-button-link';

type TemplateData = Pick<
  FormFieldsCommute,
  'seats' | 'type' | 'comment' | 'stops'
>;

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

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">
        {t('commute:templatePicker.title')}
      </h3>
      {ui
        .match('pending', () => (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[1, 0.75, 0.5].map((opacity) => (
              <Skeleton key={opacity} className="h-20" style={{ opacity }} />
            ))}
          </div>
        ))
        .match('error', () => null)
        .match('empty', () => (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <featureIcons.CommuteTemplates />
              </EmptyMedia>
              <EmptyTitle>{t('commute:templatePicker.emptyState')}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
              <OrgButtonLink
                to="/app/$orgSlug/account/commute-templates/new"
                variant="secondary"
                size="sm"
              >
                <PlusIcon />
                {t('commuteTemplate:list.newAction')}
              </OrgButtonLink>
            </EmptyContent>
          </Empty>
        ))
        .match('default', ({ items }) => (
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
        ))
        .exhaustive()}
    </div>
  );
};
