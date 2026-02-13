import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ExternalLinkIcon, PlusIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

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
import { ResponsiveIconButtonLink } from '@/components/ui/responsive-icon-button-link';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageLocations = () => {
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
        toast.success('Location deleted');
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

  return (
    <PageLayout>
      <PageLayoutTopBar
        endActions={
          <ResponsiveIconButtonLink
            label="New Location"
            variant="secondary"
            size="sm"
            to="/app/account/locations/new"
          >
            <PlusIcon />
          </ResponsiveIconButtonLink>
        }
      >
        <PageLayoutTopBarTitle>Locations</PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        <DataList>
          {ui
            .match('pending', () => <DataListLoadingState />)
            .match('error', () => (
              <DataListErrorState retry={() => locationsQuery.refetch()} />
            ))
            .match('empty', () => <DataListEmptyState />)
            .match('default', ({ items }) => (
              <>
                {items.map((item) => (
                  <DataListRow key={item.id} role="row" withHover>
                    <DataListCell>
                      <DataListText className="font-medium">
                        <Link
                          to="/app/account/locations/$id/update"
                          params={{ id: item.id }}
                        >
                          {item.name}
                          <span className="absolute inset-0" />
                        </Link>
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
                        label="Maps"
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
                        description="You are about to delete this location."
                        confirmText="Delete"
                        confirmVariant="destructive"
                        onConfirm={() =>
                          locationDelete.mutateAsync({ id: item.id })
                        }
                      >
                        <ResponsiveIconButton
                          variant="ghost"
                          size="sm"
                          className="relative z-10"
                          label="Delete"
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
                        Load more
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
