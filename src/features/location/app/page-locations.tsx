import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { PencilIcon, PlusIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { featureIcons } from '@/lib/feature-icons';
import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';
import { DataListErrorState } from '@/components/ui/datalist';
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';

import {
  LocationCardSkeleton,
  LocationMapPreview,
} from '@/features/location/app/location-card';
import { LocationDrawer } from '@/features/location/app/location-drawer';
import { locationsInfiniteOptions } from '@/features/location/location-queries';
import { useShouldShowNav } from '@/layout/app/layout';
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

  useShouldShowNav('desktop-only');
  const locationsQuery = useInfiniteQuery(locationsInfiniteOptions());

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
        className="[view-transition-name:none]"
        startActions={<BackButton viewTransition={{ types: ['slide-down'] }} />}
        endActions={
          <Button variant="secondary" size="sm" onClick={openCreateDrawer}>
            <PlusIcon />
            {t('location:list.newAction')}
          </Button>
        }
      >
        <PageLayoutTopBarTitle>
          {t('location:list.title')}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {ui
          .match('pending', () => (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[1, 0.7, 0.4].map((opacity) => (
                <LocationCardSkeleton key={opacity} opacity={opacity} />
              ))}
            </div>
          ))
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
              <EmptyContent>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={openCreateDrawer}
                >
                  <PlusIcon />
                  {t('location:list.newAction')}
                </Button>
              </EmptyContent>
            </Empty>
          ))
          .match('default', ({ items }) => (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    data-testid="location-card"
                    className="group relative flex flex-col overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md dark:bg-neutral-900"
                  >
                    {/* Map preview → opens in Google Maps */}
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(item.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative block aspect-[16/9] overflow-hidden bg-neutral-100 dark:bg-neutral-800"
                    >
                      <LocationMapPreview address={item.address} />
                    </a>

                    {/* Card body */}
                    <div className="flex items-start gap-2 p-3">
                      <button
                        type="button"
                        onClick={() => openEditDrawer(item.id)}
                        className="flex min-w-0 flex-1 flex-col items-start text-left"
                      >
                        <span className="w-full truncate text-sm font-medium">
                          {item.name}
                        </span>
                        <span className="w-full truncate text-xs text-muted-foreground">
                          {item.address}
                        </span>
                      </button>

                      <div className="flex shrink-0 items-center gap-0.5">
                        <ResponsiveIconButton
                          variant="ghost"
                          size="sm"
                          label={t('common:actions.edit')}
                          onClick={() => openEditDrawer(item.id)}
                        >
                          <PencilIcon className="size-4" />
                        </ResponsiveIconButton>
                        <ConfirmResponsiveDrawer
                          title={item.name}
                          description={t(
                            'location:list.deleteConfirmDescription'
                          )}
                          confirmText={t('common:actions.delete')}
                          confirmVariant="destructive"
                          icon={<featureIcons.Locations />}
                          onConfirm={() =>
                            locationDelete.mutateAsync({ id: item.id })
                          }
                        >
                          <ResponsiveIconButton
                            variant="ghost"
                            size="sm"
                            label={t('common:actions.delete')}
                          >
                            <Trash2 className="size-4" />
                          </ResponsiveIconButton>
                        </ConfirmResponsiveDrawer>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {locationsQuery.hasNextPage && (
                <div className="flex justify-center">
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => locationsQuery.fetchNextPage()}
                    loading={locationsQuery.isFetchingNextPage}
                  >
                    {t('location:list.loadMore')}
                  </Button>
                </div>
              )}
            </div>
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
