import { getUiState } from '@bearstudio/ui-state';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import '@/lib/dayjs/config';

import { featureIcons } from '@/lib/feature-icons';
import { orpc } from '@/lib/orpc/client';

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
import { BookingDrawer } from '@/features/booking/booking-drawer';
import {
  CommuteEnriched,
  type CommuteType,
  type StopEnriched,
  type UserSummary,
} from '@/features/commute/schema';
import { DashboardCommuteCard } from '@/features/dashboard/dashboard-commute-card';
import { useDashboardSearchParams } from '@/features/dashboard/dashboard-search-params';
import {
  OrgButtonLink,
  OrgFloatingActionButtonLink,
} from '@/features/organization/org-button-link';
import { OrgLink } from '@/features/organization/org-link';
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

  const [{ bookingStop: bookingStopId, openCommutes: initialOpenCommutes }] =
    useDashboardSearchParams();
  const [, setSearchParams] = useDashboardSearchParams();
  const [openCommuteIds, setOpenCommuteIds] =
    useState<string[]>(initialOpenCommutes);

  const today = dayjs().startOf('day');
  const rangeEnd = today.add(7, 'day');

  const commutesQuery = useQuery(
    orpc.commute.getByDate.queryOptions({
      input: {
        from: today.toDate(),
        to: rangeEnd.toDate(),
      },
    })
  );

  const bookingInfo =
    commutesQuery.data
      ?.flatMap((commute) => {
        const orders = commute.stops.map((s) => s.order);
        const minOrder = Math.min(...orders);
        const maxOrder = Math.max(...orders);
        return commute.stops.map((stop) => ({
          stopId: stop.id,
          commuteType: commute.type as CommuteType,
          commuteDate: commute.date,
          stop: stop as StopEnriched,
          driver: commute.driver as UserSummary,
          isFirstStop: stop.order === minOrder,
          isLastStop: stop.order === maxOrder,
        }));
      })
      .find((s) => s.stopId === bookingStopId) ?? null;

  const isDriverBooking = bookingInfo?.driver?.id === currentUserId;

  useEffect(() => {
    if (isDriverBooking) {
      setSearchParams({ bookingStop: null });
    }
  }, [isDriverBooking, setSearchParams]);

  const commuteCancel = useMutation(
    orpc.commute.cancel.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        toast.success(t('dashboard:cancelCommute.successMessage'));
        await context.client.invalidateQueries({
          queryKey: orpc.commute.getByDate.key(),
          type: 'all',
        });
      },
      onError: () => toast.error(t('dashboard:cancelCommute.errorMessage')),
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
      onError: () => toast.error(t('dashboard:cancelBooking.errorMessage')),
    })
  );

  // Group commutes by day
  const commutesByDay = new Map<string, CommuteEnriched[]>();
  for (const commute of commutesQuery.data ?? []) {
    const key = dayjs(commute.date).f('common:iso');
    const existing = commutesByDay.get(key) ?? [];
    existing.push(commute);
    commutesByDay.set(key, existing);
  }

  // Generate 7 days starting from today
  const days = Array.from({ length: 7 }, (_, i) => today.add(i, 'day'));

  const ui = getUiState((set) => {
    if (commutesQuery.status === 'pending') return set('pending');
    if (commutesQuery.status === 'error') return set('error');
    return set('default');
  });

  return (
    <PageLayout>
      <PageLayoutTopBar
        endActions={
          <OrgFloatingActionButtonLink
            label={t('dashboard:newCommuteAction')}
            variant="secondary"
            size="sm"
            to="/app/$orgSlug/commutes/new"
          >
            <PlusIcon />
          </OrgFloatingActionButtonLink>
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
                const key = dayjs(day).f('common:iso');
                const isToday = day.isToday();
                const dayCommutes = commutesByDay.get(key) ?? [];

                return (
                  <div key={key} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold">
                        {isToday
                          ? t('dashboard:today')
                          : dayjs(day).f('dashboard:dayHeader')}
                      </h2>

                      <OrgButtonLink
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                        to="/app/$orgSlug/commutes/new"
                        search={{ date: day.toDate() }}
                      >
                        <PlusIcon />
                        {t('dashboard:newCommuteAction')}
                      </OrgButtonLink>
                    </div>

                    {dayCommutes.length === 0 ? (
                      <OrgLink
                        to="/app/$orgSlug/commutes/new"
                        search={{ date: day.toDate() }}
                      >
                        <Empty className="border p-4 transition-colors hover:bg-accent">
                          <EmptyHeader>
                            <EmptyMedia variant="icon">
                              <featureIcons.Commutes />
                            </EmptyMedia>
                            <EmptyTitle className="text-sm">
                              {t('dashboard:noCommutesForDay')}
                            </EmptyTitle>
                          </EmptyHeader>
                        </Empty>
                      </OrgLink>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {dayCommutes.map((item) => (
                          <DashboardCommuteCard
                            key={item.id}
                            commute={item}
                            currentUserId={currentUserId}
                            commuteCancel={commuteCancel}
                            bookingCancel={bookingCancel}
                            open={openCommuteIds.includes(item.id)}
                            onOpenChange={(open) =>
                              setOpenCommuteIds((prev) =>
                                open
                                  ? [...prev, item.id]
                                  : prev.filter((id) => id !== item.id)
                              )
                            }
                            onBookStop={(stopId) =>
                              setSearchParams({ bookingStop: stopId })
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
          .exhaustive()}

        <BookingDrawer
          stopId={bookingInfo?.stopId ?? ''}
          commuteType={bookingInfo?.commuteType ?? 'ROUND'}
          commuteDate={bookingInfo?.commuteDate ?? new Date()}
          stop={bookingInfo?.stop ?? null}
          driver={bookingInfo?.driver ?? null}
          isFirstStop={bookingInfo?.isFirstStop ?? false}
          isLastStop={bookingInfo?.isLastStop ?? false}
          open={bookingInfo !== null && !!currentUserId && !isDriverBooking}
          onOpenChange={(open) => {
            if (!open) setSearchParams({ bookingStop: null });
          }}
        />
      </PageLayoutContent>
    </PageLayout>
  );
};
