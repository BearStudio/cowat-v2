import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { PlusIcon, RepeatIcon, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';
import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';
import {
  DataList,
  DataListCell,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListText,
} from '@/components/ui/datalist';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';
import { ResponsiveIconButtonLink } from '@/components/ui/responsive-icon-button-link';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageCommuteTemplates = () => {
  const { t } = useTranslation(['commuteTemplate', 'common']);

  const templatesQuery = useInfiniteQuery(
    orpc.commuteTemplate.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({
        cursor,
      }),
      initialPageParam: undefined,
      maxPages: 10,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const templateDelete = useMutation(
    orpc.commuteTemplate.delete.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        toast.success(t('commuteTemplate:list.deleteSuccessMessage'));
        await context.client.invalidateQueries({
          queryKey: orpc.commuteTemplate.getAll.key(),
          type: 'all',
        });
      },
    })
  );

  const ui = getUiState((set) => {
    if (templatesQuery.status === 'pending') return set('pending');
    if (templatesQuery.status === 'error') return set('error');
    const items = templatesQuery.data?.pages.flatMap((p) => p.items) ?? [];
    if (!items.length) return set('empty');
    return set('default', { items });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar
        endActions={
          <ResponsiveIconButtonLink
            label={t('commuteTemplate:list.newAction')}
            variant="secondary"
            size="sm"
            // TODO: remove cast when route is created
            to={'/app/account/commute-templates/new' as never}
          >
            <PlusIcon />
          </ResponsiveIconButtonLink>
        }
      >
        <PageLayoutTopBarTitle>
          {t('commuteTemplate:list.title')}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {ui
          .match('pending', () => <DataListLoadingState />)
          .match('error', () => (
            <DataListErrorState retry={() => templatesQuery.refetch()} />
          ))
          .match('empty', () => (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <RepeatIcon />
                </EmptyMedia>
                <EmptyTitle>{t('commuteTemplate:list.emptyState')}</EmptyTitle>
              </EmptyHeader>
            </Empty>
          ))
          .match('default', ({ items }) => (
            <DataList>
              {items.map((item) => (
                <DataListRow key={item.id} role="row" withHover>
                  <DataListCell>
                    <DataListText className="font-medium">
                      <Link
                        // TODO: remove casts when route is created
                        to={
                          '/app/account/commute-templates/$id/update' as never
                        }
                        params={{ id: item.id } as never}
                      >
                        {item.name}
                        <span className="absolute inset-0" />
                      </Link>
                    </DataListText>
                    <DataListText className="text-xs text-muted-foreground">
                      {item.type} &middot; {item.outwardTime}
                      {item.inwardTime
                        ? ` / ${item.inwardTime}`
                        : ''} &middot; {item.seats} seats
                    </DataListText>
                  </DataListCell>
                  <DataListCell className="flex-none">
                    <ConfirmResponsiveDrawer
                      description={t(
                        'commuteTemplate:list.deleteConfirmDescription'
                      )}
                      confirmText={t('common:actions.delete')}
                      confirmVariant="destructive"
                      onConfirm={() =>
                        templateDelete.mutateAsync({ id: item.id })
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
              {templatesQuery.hasNextPage && (
                <DataListRow>
                  <DataListCell className="flex-none">
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => templatesQuery.fetchNextPage()}
                      loading={templatesQuery.isFetchingNextPage}
                    >
                      {t('commuteTemplate:list.loadMore')}
                    </Button>
                  </DataListCell>
                </DataListRow>
              )}
            </DataList>
          ))
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
