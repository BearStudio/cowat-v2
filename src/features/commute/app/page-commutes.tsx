import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { match } from 'ts-pattern';

import { orpc } from '@/lib/orpc/client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';
import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListText,
} from '@/components/ui/datalist';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageCommutes = () => {
  const { t } = useTranslation(['commute', 'common']);

  const commutesQuery = useInfiniteQuery(
    orpc.commute.getMyCommutes.infiniteOptions({
      input: (cursor: string | undefined) => ({
        cursor,
      }),
      initialPageParam: undefined,
      maxPages: 10,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const commuteCancel = useMutation(
    orpc.commute.cancel.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        toast.success(t('commute:list.cancelSuccessMessage'));
        await context.client.invalidateQueries({
          queryKey: orpc.commute.getMyCommutes.key(),
          type: 'all',
        });
      },
    })
  );

  const ui = getUiState((set) => {
    if (commutesQuery.status === 'pending') return set('pending');
    if (commutesQuery.status === 'error') return set('error');
    const items = commutesQuery.data?.pages.flatMap((p) => p.items) ?? [];
    if (!items.length) return set('empty');
    return set('default', { items });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar>
        <PageLayoutTopBarTitle>{t('commute:list.title')}</PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        <DataList>
          {ui
            .match('pending', () => <DataListLoadingState />)
            .match('error', () => (
              <DataListErrorState retry={() => commutesQuery.refetch()} />
            ))
            .match('empty', () => <DataListEmptyState />)
            .match('default', ({ items }) => (
              <>
                {items.map((item) => (
                  <DataListRow key={item.id} role="row" withHover>
                    <DataListCell>
                      <DataListText className="font-medium">
                        {dayjs(item.date).format('DD/MM/YYYY')}
                      </DataListText>
                      <DataListText className="text-xs text-muted-foreground">
                        {t(`commute:list.type.${item.type}`)}
                        {' · '}
                        {t('commute:list.seats', { count: item.seats })}
                        {' · '}
                        {t('commute:list.stops', {
                          count: item.stops.length,
                        })}
                      </DataListText>
                    </DataListCell>
                    <DataListCell className="flex-none">
                      <Badge
                        variant={match(item.status)
                          .returnType<'positive' | 'warning' | 'secondary'>()
                          .with('ON_TIME', () => 'positive')
                          .with('DELAYED', () => 'warning')
                          .otherwise(() => 'secondary')}
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </DataListCell>
                    <DataListCell className="flex-none">
                      <ConfirmResponsiveDrawer
                        description={t('commute:list.cancelConfirmDescription')}
                        confirmText={t('common:actions.delete')}
                        confirmVariant="destructive"
                        onConfirm={() =>
                          commuteCancel.mutateAsync({ id: item.id })
                        }
                      >
                        <ResponsiveIconButton
                          variant="ghost"
                          size="sm"
                          className="relative z-10"
                          label={t('common:actions.delete')}
                        >
                          <Trash2 />
                        </ResponsiveIconButton>
                      </ConfirmResponsiveDrawer>
                    </DataListCell>
                  </DataListRow>
                ))}
                {commutesQuery.hasNextPage && (
                  <DataListRow>
                    <DataListCell className="flex-none">
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => commutesQuery.fetchNextPage()}
                        loading={commutesQuery.isFetchingNextPage}
                      >
                        {t('commute:list.loadMore')}
                      </Button>
                    </DataListCell>
                  </DataListRow>
                )}
              </>
            ))
            .exhaustive()}
        </DataList>
      </PageLayoutContent>
    </PageLayout>
  );
};
