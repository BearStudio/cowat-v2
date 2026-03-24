import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
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
    .match('pending', () => <DataListLoadingState />)
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
            to="/app/$orgSlug/commutes/request"
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
            <h3 className="text-sm font-medium text-muted-foreground">
              {t('commuteRequest:list.otherRequests')}
            </h3>
            {otherRequests.map((item) => (
              <CommuteRequestCard
                key={item.id}
                request={item}
                isOwner={false}
              />
            ))}
          </section>
        )}

        {myRequests.length > 0 && (
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              {t('commuteRequest:list.myRequests')}
            </h3>
            {myRequests.map((item) => (
              <CommuteRequestCard key={item.id} request={item} isOwner />
            ))}
          </section>
        )}

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
