import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { CarIcon, MapPinIcon, PlusIcon, RepeatIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

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

import { authClient } from '@/features/auth/client';
import { BookingStatusBadge } from '@/features/booking/booking-status-badge';
import { getUserBookingStatus } from '@/features/booking/status-colors';
import {
  CardCommute,
  CardCommuteContent,
  CardCommuteHeader,
  CardCommuteTrigger,
} from '@/features/commute/card-commute';
import { CardCommuteActions } from '@/features/commute/card-commute-actions';
import { CardCommutePassengersList } from '@/features/commute/card-commute-passengers-list';
import { CardCommuteStopsList } from '@/features/commute/card-commute-stops-list';
import { getCommutePassengerStats } from '@/features/commute/commute-passengers';
import { OrgResponsiveIconButtonLink } from '@/features/organization/org-button-link';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageCommutes = () => {
  const { t } = useTranslation([
    'commute',
    'common',
    'location',
    'commuteTemplate',
  ]);
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
          <>
            <OrgResponsiveIconButtonLink
              label={t('location:list.title')}
              variant="ghost"
              size="sm"
              to="/app/$orgSlug/account/locations"
            >
              <MapPinIcon />
            </OrgResponsiveIconButtonLink>
            <OrgResponsiveIconButtonLink
              label={t('commuteTemplate:list.title')}
              variant="ghost"
              size="sm"
              to="/app/$orgSlug/account/commute-templates"
            >
              <RepeatIcon />
            </OrgResponsiveIconButtonLink>
            <OrgResponsiveIconButtonLink
              label={t('commute:list.newAction')}
              variant="secondary"
              size="sm"
              to="/app/$orgSlug/commutes/new"
            >
              <PlusIcon />
            </OrgResponsiveIconButtonLink>
          </>
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
                const {
                  outwardPassengers,
                  inwardPassengers,
                  acceptedPassengers,
                } = getCommutePassengerStats(item);
                const currentUserId = session.data?.user.id ?? '';
                const isDriver = currentUserId === item.driver.id;
                const bookingStatus = getUserBookingStatus(item, currentUserId);

                return (
                  <CardCommute key={item.id} bookingStatus={bookingStatus}>
                    <CardCommuteTrigger>
                      <CardCommuteHeader
                        driver={item.driver}
                        date={item.date}
                        type={item.type}
                        totalSeats={item.seats}
                        outwardAvailable={item.seats - outwardPassengers.size}
                        inwardAvailable={
                          item.type === 'ROUND'
                            ? item.seats - inwardPassengers.size
                            : undefined
                        }
                        badge={<BookingStatusBadge status={bookingStatus} />}
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
                        <CardCommuteActions
                          isDriver={isDriver}
                          driverPhone={item.driver.phone}
                          cancelConfirmDescription={t(
                            'commute:list.cancelConfirmDescription'
                          )}
                          onCancel={() =>
                            commuteCancel.mutateAsync({ id: item.id })
                          }
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
