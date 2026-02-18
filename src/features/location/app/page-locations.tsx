import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { ExternalLinkIcon, PlusIcon, Trash2 } from 'lucide-react';

import { featureIcons } from '@/lib/feature-icons';
import { useState } from 'react';
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

import { LocationDrawer } from '@/features/location/app/location-drawer';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageLocations = () => {
  const { t } = useTranslation(['location', 'common']);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(
    null
  );

  const locationsQuery = useInfiniteQuery(
    orpc.location.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({
        cursor,
      }),
      initialPageParam: undefined,
      maxPages: 10,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const locationDelete = useMutation(
    orpc.location.delete.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        toast.success(t('location:list.deleteSuccessMessage'));
        await context.client.invalidateQueries({
          queryKey: orpc.location.getAll.key(),
          type: 'all',
        });
      },
    })
  );

  const ui = getUiState((set) => {
    if (locationsQuery.status === 'pending') return set('pending');
    if (locationsQuery.status === 'error') return set('error');
    const items = locationsQuery.data?.pages.flatMap((p) => p.items) ?? [];
    if (!items.length) return set('empty');
    return set('default', { items });
  });

  const openCreateDrawer = () => {
    setEditingLocationId(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (id: string) => {
    setEditingLocationId(id);
    setIsDrawerOpen(true);
  };

  return (
    <PageLayout>
      <PageLayoutTopBar
        endActions={
          <ResponsiveIconButton
            label={t('location:list.newAction')}
            variant="secondary"
            size="sm"
            onClick={openCreateDrawer}
          >
            <PlusIcon />
          </ResponsiveIconButton>
        }
      >
        <PageLayoutTopBarTitle>
          {t('location:list.title')}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {ui
          .match('pending', () => <DataListLoadingState />)
          .match('error', () => (
            <DataListErrorState retry={() => locationsQuery.refetch()} />
          ))
          .match('empty', () => (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <featureIcons.Locations />
                </EmptyMedia>
                <EmptyTitle>{t('location:list.emptyState')}</EmptyTitle>
              </EmptyHeader>
            </Empty>
          ))
          .match('default', ({ items }) => (
            <DataList>
              {items.map((item) => (
                <DataListRow key={item.id} role="row" withHover>
                  <DataListCell>
                    <DataListText className="font-medium">
                      <button
                        type="button"
                        onClick={() => openEditDrawer(item.id)}
                      >
                        {item.name}
                        <span className="absolute inset-0" />
                      </button>
                    </DataListText>
                    <DataListText className="text-xs text-muted-foreground">
                      {item.address}
                    </DataListText>
                  </DataListCell>
                  <DataListCell className="flex-none">
                    <ResponsiveIconButton
                      variant="ghost"
                      size="sm"
                      nativeButton={false}
                      className="relative z-10"
                      label={t('location:list.mapsAction')}
                      render={
                        <a
                          href={`https://www.google.com/maps/search/${encodeURIComponent(item.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      <ExternalLinkIcon className="size-4" />
                    </ResponsiveIconButton>
                  </DataListCell>
                  <DataListCell className="flex-none">
                    <ConfirmResponsiveDrawer
                      description={t('location:list.deleteConfirmDescription')}
                      confirmText={t('common:actions.delete')}
                      confirmVariant="destructive"
                      onConfirm={() =>
                        locationDelete.mutateAsync({ id: item.id })
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
              {locationsQuery.hasNextPage && (
                <DataListRow>
                  <DataListCell className="flex-none">
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => locationsQuery.fetchNextPage()}
                      loading={locationsQuery.isFetchingNextPage}
                    >
                      {t('location:list.loadMore')}
                    </Button>
                  </DataListCell>
                </DataListRow>
              )}
            </DataList>
          ))
          .exhaustive()}
      </PageLayoutContent>

      <LocationDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        locationId={editingLocationId}
      />
    </PageLayout>
  );
};
