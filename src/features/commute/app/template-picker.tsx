import { getUiState } from '@bearstudio/ui-state';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, RepeatIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { ButtonLink } from '@/components/ui/button-link';
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';

import type { FormFieldsCommute } from '@/features/commute/schema';
import { CommuteTemplateSummary } from '@/features/commute-template/commute-template-summary';

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
                <RepeatIcon />
              </EmptyMedia>
              <EmptyTitle>{t('commute:templatePicker.emptyState')}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
              <ButtonLink
                to="/app/account/commute-templates/new"
                variant="secondary"
                size="sm"
              >
                <PlusIcon />
                {t('commuteTemplate:list.newAction')}
              </ButtonLink>
            </EmptyContent>
          </Empty>
        ))
        .match('default', ({ items }) => (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="flex cursor-pointer flex-col items-start gap-1 rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted/50"
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-xs text-muted-foreground">
                  <CommuteTemplateSummary
                    type={item.type}
                    stopsCount={item.stops.length}
                    seats={item.seats}
                  />
                </span>
              </button>
            ))}
          </div>
        ))
        .exhaustive()}
    </div>
  );
};
