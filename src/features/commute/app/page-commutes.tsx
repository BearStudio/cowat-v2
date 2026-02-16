import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { CarIcon, PlusIcon, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';
import {
  CardCommute,
  CardCommuteContent,
  CardCommuteHeader,
  CardCommuteTrigger,
} from '@/components/ui/card-commute';
import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';
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
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';

import { authClient } from '@/features/auth/client';
import { CardCommutePassengersList } from '@/features/commute/card-commute-passengers-list';
import { CardCommuteStopsList } from '@/features/commute/card-commute-stops-list';
import { OrgResponsiveIconButtonLink } from '@/features/organization/org-button-link';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageCommutes = () => {
  const { t } = useTranslation(['commute', 'common']);
  const session = authClient.useSession();

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
      <PageLayoutTopBar
        endActions={
          <OrgResponsiveIconButtonLink
            label={t('commute:list.newAction')}
            variant="secondary"
            size="sm"
            to="/app/$orgSlug/commutes/new"
          >
            <PlusIcon />
          </OrgResponsiveIconButtonLink>
        }
      >
        <PageLayoutTopBarTitle>{t('commute:list.title')}</PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {ui
          .match('pending', () => <DataListLoadingState />)
          .match('error', () => (
            <DataListErrorState retry={() => commutesQuery.refetch()} />
          ))
          .match('empty', () => (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CarIcon />
                </EmptyMedia>
                <EmptyTitle>{t('commute:list.emptyState')}</EmptyTitle>
              </EmptyHeader>
            </Empty>
          ))
          .match('default', ({ items }) => (
            <div className="flex flex-col gap-3">
              {items.map((item) => {
                const acceptedPassengers = new Map<
                  string,
                  { id: string; name?: string | null; image?: string | null }
                >();
                for (const stop of item.stops) {
                  for (const sp of stop.passengers) {
                    if (
                      sp.status === 'ACCEPTED' &&
                      !acceptedPassengers.has(sp.passenger.id)
                    ) {
                      acceptedPassengers.set(sp.passenger.id, sp.passenger);
                    }
                  }
                }
                const available = item.seats - acceptedPassengers.size;
                const isDriver = session.data?.user.id === item.driver.id;

                return (
                  <CardCommute key={item.id}>
                    <CardCommuteTrigger>
                      <CardCommuteHeader
                        driver={item.driver}
                        date={item.date}
                        status={item.status}
                        type={item.type}
                        availableSeats={available}
                        totalSeats={item.seats}
                        actions={
                          isDriver && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <ConfirmResponsiveDrawer
                                description={t(
                                  'commute:list.cancelConfirmDescription'
                                )}
                                confirmText={t('common:actions.delete')}
                                confirmVariant="destructive"
                                onConfirm={() =>
                                  commuteCancel.mutateAsync({ id: item.id })
                                }
                              >
                                <ResponsiveIconButton
                                  variant="ghost"
                                  size="sm"
                                  label={t('common:actions.delete')}
                                >
                                  <Trash2 />
                                </ResponsiveIconButton>
                              </ConfirmResponsiveDrawer>
                            </div>
                          )
                        }
                      />
                    </CardCommuteTrigger>
                    <CardCommuteContent>
                      <div className="flex flex-col gap-2">
                        {item.comment && (
                          <p className="text-sm text-muted-foreground">
                            {item.comment}
                          </p>
                        )}
                        <CardCommuteStopsList stops={item.stops} />
                        <CardCommutePassengersList
                          passengers={[...acceptedPassengers.values()]}
                        />
                      </div>
                    </CardCommuteContent>
                  </CardCommute>
                );
              })}
              {commutesQuery.hasNextPage && (
                <div className="flex justify-center">
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => commutesQuery.fetchNextPage()}
                    loading={commutesQuery.isFetchingNextPage}
                  >
                    {t('commute:list.loadMore')}
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
