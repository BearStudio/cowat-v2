import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { featureIcons } from '@/lib/feature-icons';
import { orpc } from '@/lib/orpc/client';

import { LoadMoreButton } from '@/components/load-more-button';
import { CardListSkeleton } from '@/components/loading/card-list-skeleton';
import { DataListErrorState } from '@/components/ui/datalist';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

import { RequestCard } from '@/features/booking/request-card';

export const BookingRequestsList = () => {
  const { t } = useTranslation(['booking']);

  const requestsQuery = useInfiniteQuery(
    orpc.booking.getRequestsForDriver.infiniteOptions({
      input: (cursor: string | undefined) => ({
        cursor,
      }),
      initialPageParam: undefined,
      maxPages: 10,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const ui = getUiState((set) => {
    if (requestsQuery.status === 'pending') return set('pending');
    if (requestsQuery.status === 'error') return set('error');
    const items = requestsQuery.data?.pages.flatMap((p) => p.items) ?? [];
    if (!items.length) return set('empty');
    return set('default', { items });
  });

  return ui
    .match('pending', () => <CardListSkeleton />)
    .match('error', () => (
      <DataListErrorState retry={() => requestsQuery.refetch()} />
    ))
    .match('empty', () => (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <featureIcons.Bookings />
          </EmptyMedia>
          <EmptyTitle>{t('booking:requests.emptyState')}</EmptyTitle>
          <EmptyDescription>
            {t('booking:requests.emptyDescription')}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    ))
    .match('default', ({ items }) => (
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <RequestCard key={item.id} request={item} />
        ))}
        <LoadMoreButton
          query={requestsQuery}
          label={t('booking:requests.loadMore')}
        />
      </div>
    ))
    .exhaustive();
};
