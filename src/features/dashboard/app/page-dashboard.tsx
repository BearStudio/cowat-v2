import { getUiState } from '@bearstudio/ui-state';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { PlusIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { Badge } from '@/components/ui/badge';
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
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';
import { ResponsiveIconButtonLink } from '@/components/ui/responsive-icon-button-link';

import { authClient } from '@/features/auth/client';
import { CardCommutePassengersList } from '@/features/commute/card-commute-passengers-list';
import { CardCommuteStopsList } from '@/features/commute/card-commute-stops-list';
import { CommuteEnriched, StopEnriched } from '@/features/commute/schema';
import { BookingDrawer } from '@/features/dashboard/booking-drawer';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageDashboard = () => {
  const { t } = useTranslation(['dashboard', 'commute', 'common']);
  const session = authClient.useSession();
  const currentUserId = session.data?.user.id ?? '';
  const [bookingStopId, setBookingStopId] = useState<string | null>(null);

  const weekStart = dayjs().startOf('isoWeek');
  const weekEnd = weekStart.add(7, 'day');

  const commutesQuery = useQuery(
    orpc.commute.getByDate.queryOptions({
      input: {
        from: weekStart.toDate(),
        to: weekEnd.toDate(),
      },
    })
  );

  const commuteCancel = useMutation(
    orpc.commute.cancel.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        toast.success(t('dashboard:cancelCommute.successMessage'));
        await context.client.invalidateQueries({
          queryKey: orpc.commute.getByDate.key(),
          type: 'all',
        });
      },
    })
  );

  const bookingCancel = useMutation(
    orpc.booking.cancel.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        toast.success(t('dashboard:cancelBooking.successMessage'));
        await context.client.invalidateQueries({
          queryKey: orpc.commute.getByDate.key(),
          type: 'all',
        });
      },
    })
  );

  // Group commutes by day
  const commutesByDay = new Map<string, CommuteEnriched[]>();
  for (const commute of commutesQuery.data ?? []) {
    const key = dayjs(commute.date).format('YYYY-MM-DD');
    const existing = commutesByDay.get(key) ?? [];
    existing.push(commute);
    commutesByDay.set(key, existing);
  }

  // Generate all 7 days (Mon-Sun)
  const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
  const today = dayjs().format('YYYY-MM-DD');

  const ui = getUiState((set) => {
    if (commutesQuery.status === 'pending') return set('pending');
    if (commutesQuery.status === 'error') return set('error');
    return set('default');
  });

  return (
    <PageLayout>
      <PageLayoutTopBar
        endActions={
          <ResponsiveIconButtonLink
            label={t('dashboard:newCommuteAction')}
            variant="secondary"
            size="sm"
            to="/app/commutes/new"
          >
            <PlusIcon />
          </ResponsiveIconButtonLink>
        }
      >
        <PageLayoutTopBarTitle>{t('dashboard:title')}</PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent containerClassName="max-w-4xl">
        {ui
          .match('pending', () => <DataListLoadingState />)
          .match('error', () => (
            <DataListErrorState retry={() => commutesQuery.refetch()} />
          ))
          .match('default', () => (
            <div className="flex flex-col gap-6">
              {days.map((day) => {
                const key = day.format('YYYY-MM-DD');
                const isToday = key === today;
                const dayCommutes = commutesByDay.get(key) ?? [];

                return (
                  <div key={key} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold">
                        {day.format('dddd DD/MM')}
                      </h2>
                      {isToday && (
                        <Badge variant="positive" size="sm">
                          {t('dashboard:today')}
                        </Badge>
                      )}
                    </div>

                    {dayCommutes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {t('dashboard:noCommutesForDay')}
                      </p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {dayCommutes.map((item) => {
                          const acceptedPassengers = new Map<
                            string,
                            {
                              id: string;
                              name?: string | null;
                              image?: string | null;
                            }
                          >();
                          for (const stop of item.stops) {
                            for (const sp of stop.passengers) {
                              if (
                                sp.status === 'ACCEPTED' &&
                                !acceptedPassengers.has(sp.passenger.id)
                              ) {
                                acceptedPassengers.set(
                                  sp.passenger.id,
                                  sp.passenger
                                );
                              }
                            }
                          }
                          const available =
                            item.seats - acceptedPassengers.size;
                          const isDriver = currentUserId === item.driverId;

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
                                            'dashboard:cancelCommute.confirmDescription'
                                          )}
                                          confirmText={t(
                                            'common:actions.delete'
                                          )}
                                          confirmVariant="destructive"
                                          onConfirm={() =>
                                            commuteCancel.mutateAsync({
                                              id: item.id,
                                            })
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
                                  <CardCommuteStopsList
                                    stops={item.stops}
                                    renderActions={(stop) => {
                                      if (isDriver) return null;
                                      const enrichedStop = stop as StopEnriched;
                                      const userBooking =
                                        enrichedStop.passengers?.find(
                                          (p) =>
                                            p.passenger.id === currentUserId &&
                                            (p.status === 'REQUESTED' ||
                                              p.status === 'ACCEPTED')
                                        );
                                      if (userBooking) {
                                        return (
                                          <ConfirmResponsiveDrawer
                                            description={t(
                                              'dashboard:cancelBooking.confirmDescription'
                                            )}
                                            confirmText={t(
                                              'common:actions.delete'
                                            )}
                                            confirmVariant="destructive"
                                            onConfirm={() =>
                                              bookingCancel.mutateAsync({
                                                id: userBooking.id,
                                              })
                                            }
                                          >
                                            <Button
                                              size="xs"
                                              variant="destructive"
                                            >
                                              {t('common:actions.cancel')}
                                            </Button>
                                          </ConfirmResponsiveDrawer>
                                        );
                                      }
                                      return (
                                        <Button
                                          size="xs"
                                          variant="secondary"
                                          onClick={() =>
                                            setBookingStopId(stop.id)
                                          }
                                        >
                                          {t('dashboard:booking.submitButton')}
                                        </Button>
                                      );
                                    }}
                                  />
                                  <CardCommutePassengersList
                                    passengers={[
                                      ...acceptedPassengers.values(),
                                    ]}
                                  />
                                </div>
                              </CardCommuteContent>
                            </CardCommute>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
          .exhaustive()}

        <BookingDrawer
          stopId={bookingStopId ?? ''}
          open={bookingStopId !== null}
          onOpenChange={(open) => {
            if (!open) setBookingStopId(null);
          }}
        />
      </PageLayoutContent>
    </PageLayout>
  );
};
