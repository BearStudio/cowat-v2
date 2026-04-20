import { getUiState } from '@bearstudio/ui-state';
import { useQuery } from '@tanstack/react-query';
import { ChevronRightIcon, PlusIcon } from 'lucide-react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { featureIcons } from '@/lib/feature-icons';
import { orpc } from '@/lib/orpc/client';
import { cn } from '@/lib/tailwind/utils';

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
> & { templateName: string };

export const TemplatePicker = ({
  onSelect,
  compact = false,
}: {
  onSelect: (data: TemplateData) => void;
  compact?: boolean;
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

  const maskStyle =
    '[mask-image:linear-gradient(to_right,transparent,black_2rem,black_calc(100%-2rem),transparent)]';

  return ui
    .match('pending', () => (
      <div className={maskStyle}>
        <div className="no-scrollbar flex gap-3 overflow-x-auto ps-4 pe-4">
          {[1, 0.75, 0.5].map((opacity) => (
            <Skeleton
              key={opacity}
              className={cn('w-64 shrink-0', compact ? 'h-20' : 'h-40')}
              style={{ opacity }}
            />
          ))}
        </div>
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
            variant="secondary"
            size="sm"
            to="/app/$orgSlug/account/commute-templates/new"
          >
            <PlusIcon />
            {t('commuteTemplate:list.newAction')}
          </OrgButtonLink>
        </EmptyContent>
      </Empty>
    ))
    .match('default', ({ items }) => (
      <div className={maskStyle}>
        <div className="no-scrollbar flex gap-3 overflow-x-auto ps-4 pe-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="group w-64 shrink-0 cursor-pointer"
              onClick={() => handleSelect(item)}
            >
              <CardHeader>
                <CardCommuteTemplateHeader
                  name={item.name}
                  type={item.type}
                  stopsCount={item.stops.length}
                  seats={item.seats}
                  actions={
                    <ChevronRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  }
                />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {item.comment && (
                    <p className="text-sm text-muted-foreground">
                      {item.comment}
                    </p>
                  )}
                  {compact ? (
                    <p className="flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
                      {item.stops.map((stop, i) => (
                        <Fragment key={stop.locationId}>
                          {i > 0 && (
                            <ChevronRightIcon className="size-3 shrink-0" />
                          )}
                          <span>{stop.location.name}</span>
                        </Fragment>
                      ))}
                    </p>
                  ) : (
                    <CardCommuteStopsList
                      stops={item.stops.map((stop) => ({
                        ...stop,
                        commuteId: '',
                        passengers: [],
                      }))}
                      disableLinks
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    ))
    .exhaustive();
};
