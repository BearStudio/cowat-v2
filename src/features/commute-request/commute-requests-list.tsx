import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { featureIcons } from '@/lib/feature-icons';
import { orpc } from '@/lib/orpc/client';

import { CardListSkeleton } from '@/components/loading/card-list-skeleton';
import { Button } from '@/components/ui/button';
import { DataListErrorState } from '@/components/ui/datalist';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

import { authClient } from '@/features/auth/client';
import { CommuteRequestCard } from '@/features/commute-request/commute-request-card';
import { OrgButtonLink } from '@/features/organization/org-button-link';

export const CommuteRequestsList = () => {
  const { t } = useTranslation(['commuteRequest']);
  const session = authClient.useSession();

  const requestsQuery = useInfiniteQuery(
    orpc.commuteRequest.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({
        cursor,
      }),
      initialPageParam: undefined,
      maxPages: 10,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const allItems = useMemo(
    () => requestsQuery.data?.pages.flatMap((p) => p.items) ?? [],
    [requestsQuery.data]
  );

  const { myRequests, otherRequests } = useMemo(() => {
    const userId = session.data?.user.id;
    const mine: typeof allItems = [];
    const others: typeof allItems = [];
    for (const item of allItems) {
      if (item.requester.id === userId) {
        mine.push(item);
      } else {
        others.push(item);
      }
    }
    return { myRequests: mine, otherRequests: others };
  }, [allItems, session.data?.user.id]);

  const ui = getUiState((set) => {
    if (requestsQuery.status === 'pending') return set('pending');
    if (requestsQuery.status === 'error') return set('error');
    if (!allItems.length) return set('empty');
    return set('default');
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
            <featureIcons.CommuteRequest />
          </EmptyMedia>
          <EmptyTitle>{t('commuteRequest:list.emptyState')}</EmptyTitle>
          <EmptyDescription>
            {t('commuteRequest:list.emptyDescription')}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <OrgButtonLink
            variant="secondary"
            size="sm"
            to="/app/$orgSlug/requests/commute"
          >
            {t('commuteRequest:list.createAction')}
          </OrgButtonLink>
        </EmptyContent>
      </Empty>
    ))
    .match('default', () => (
      <div className="flex flex-col gap-6">
        {otherRequests.length > 0 && (
          <section className="flex flex-col gap-3">
            {otherRequests.map((item) => (
              <CommuteRequestCard
                key={item.id}
                request={item}
                isOwner={false}
              />
            ))}
          </section>
        )}

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <hr className="flex-1" />
            <h3 className="shrink-0 text-sm font-medium text-muted-foreground">
              {t('commuteRequest:list.myRequests')}
            </h3>
            <hr className="flex-1" />
          </div>
          {myRequests.length > 0 ? (
            myRequests.map((item) => (
              <CommuteRequestCard key={item.id} request={item} isOwner />
            ))
          ) : (
            <div className="flex flex-col items-center gap-2 py-4">
              <p className="text-sm text-muted-foreground">
                {t('commuteRequest:list.emptyMyRequests')}
              </p>
              <OrgButtonLink
                variant="secondary"
                size="sm"
                to="/app/$orgSlug/requests/commute"
              >
                {t('commuteRequest:list.createAction')}
              </OrgButtonLink>
            </div>
          )}
        </section>

        {requestsQuery.hasNextPage && (
          <div className="flex justify-center">
            <Button
              size="xs"
              variant="secondary"
              onClick={() => requestsQuery.fetchNextPage()}
              loading={requestsQuery.isFetchingNextPage}
            >
              {t('commuteRequest:list.loadMore')}
            </Button>
          </div>
        )}
      </div>
    ))
    .exhaustive();
};
