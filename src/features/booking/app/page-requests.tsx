import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { featureIcons } from '@/lib/feature-icons';
import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';
import {
  DataListErrorState,
  DataListLoadingState,
} from '@/components/ui/datalist';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

import { RequestCard } from '@/features/booking/request-card';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageRequests = () => {
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

  return (
    <PageLayout>
      <PageLayoutTopBar>
        <PageLayoutTopBarTitle>
          {t('booking:requests.title')}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {ui
          .match('pending', () => <DataListLoadingState />)
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
              </EmptyHeader>
            </Empty>
          ))
          .match('default', ({ items }) => (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <RequestCard key={item.id} request={item} />
              ))}
              {requestsQuery.hasNextPage && (
                <div className="flex justify-center">
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => requestsQuery.fetchNextPage()}
                    loading={requestsQuery.isFetchingNextPage}
                  >
                    {t('booking:requests.loadMore')}
                  </Button>
                </div>
              )}
            </div>
          ))
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
