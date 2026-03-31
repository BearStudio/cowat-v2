import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { featureIcons } from '@/lib/feature-icons';
import { orpc } from '@/lib/orpc/client';

import { CommentText } from '@/components/comment-text';
import { ConfirmSummary } from '@/components/confirm-summary';
import { CardListSkeleton } from '@/components/loading/card-list-skeleton';
import { Button } from '@/components/ui/button';
import { DataListErrorState } from '@/components/ui/datalist';
import {
  Empty,
  EmptyContent,
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
import { CardCommuteStopsList } from '@/features/commute/card-commute-stops-list';
import { CommuteOptionsMenu } from '@/features/commute/commute-options-menu';
import { getCommutePassengerStats } from '@/features/commute/commute-passenger-rules';
import {
  OrgButtonLink,
  OrgFloatingActionButtonLink,
} from '@/features/organization/org-button-link';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const myCommutesInfiniteOptions = () =>
  orpc.commute.getMyCommutes.infiniteOptions({
    input: (cursor: string | undefined) => ({
      cursor,
    }),
    initialPageParam: undefined,
    maxPages: 10,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

export const PageCommutes = () => {
  const { t } = useTranslation([
    'commute',
    'common',
    'location',
    'commuteTemplate',
  ]);
  const session = authClient.useSession();
  const commutesQuery = useInfiniteQuery(myCommutesInfiniteOptions());

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
            <CommuteOptionsMenu />
            <OrgFloatingActionButtonLink
              label={t('commute:list.newAction')}
              variant="secondary"
              size="sm"
              to="/app/$orgSlug/commutes/new"
            >
              <PlusIcon />
            </OrgFloatingActionButtonLink>
          </>
        }
      >
        <PageLayoutTopBarTitle>{t('commute:list.title')}</PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {ui
          .match('pending', () => <CardListSkeleton />)
          .match('error', () => (
            <DataListErrorState retry={() => commutesQuery.refetch()} />
          ))
          .match('empty', () => (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <featureIcons.Commutes />
                </EmptyMedia>
                <EmptyTitle>{t('commute:list.emptyState')}</EmptyTitle>
              </EmptyHeader>
              <EmptyContent>
                <OrgButtonLink
                  variant="secondary"
                  size="sm"
                  to="/app/$orgSlug/commutes/new"
                >
                  <PlusIcon />
                  {t('commute:list.newAction')}
                </OrgButtonLink>
              </EmptyContent>
            </Empty>
          ))
          .match('default', ({ items }) => (
            <div className="flex flex-col gap-3">
              {items.map((item) => {
                const { outwardCount, inwardCount, acceptedPassengers } =
                  getCommutePassengerStats(item);
                const hasPassengers = acceptedPassengers.size > 0;
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
                        outwardTaken={outwardCount}
                        inwardTaken={
                          item.type === 'ROUND' ? inwardCount : undefined
                        }
                        outwardDeparture={item.stops.at(0)?.outwardTime}
                        inwardDeparture={
                          item.stops.at(-1)?.inwardTime ?? undefined
                        }
                        passengers={[...acceptedPassengers.values()]}
                        badge={<BookingStatusBadge status={bookingStatus} />}
                      />
                    </CardCommuteTrigger>
                    <CardCommuteContent>
                      <div className="flex flex-col gap-3">
                        {item.comment && (
                          <CommentText>{item.comment}</CommentText>
                        )}
                        <CardCommuteStopsList stops={item.stops} />
                        <CardCommuteActions
                          isDriver={isDriver}
                          commuteId={item.id}
                          driverPhone={item.driver.phone}
                          cancelConfirmDescription={
                            <div className="flex flex-col gap-3">
                              <span>
                                {t(
                                  hasPassengers
                                    ? 'commute:list.cancelConfirmDescriptionWithPassengers'
                                    : 'commute:list.cancelConfirmDescription'
                                )}
                              </span>
                              <ConfirmSummary
                                user={item.driver}
                                date={item.date}
                                typeLabel={t(`commute:list.type.${item.type}`)}
                                stops={item.stops}
                              />
                            </div>
                          }
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
