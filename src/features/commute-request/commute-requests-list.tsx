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

  const ui = getUiState((set) => {
    if (requestsQuery.status === 'pending') return set('pending');
    if (requestsQuery.status === 'error') return set('error');
    const items = requestsQuery.data?.pages.flatMap((p) => p.items) ?? [];
    if (!items.length) return set('empty');
    return set('default', { items });
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
    .match('default', ({ items }) => (
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <CommuteRequestCard
            key={item.id}
            request={item}
            isOwner={item.requester.id === session.data?.user.id}
          />
        ))}
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
