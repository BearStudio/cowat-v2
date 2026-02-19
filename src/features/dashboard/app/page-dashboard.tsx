import { getUiState } from '@bearstudio/ui-state';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { CalendarIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { formatDate } from '@/lib/dayjs/formats';
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
import { CommuteEnriched, type CommuteType } from '@/features/commute/schema';
import { DashboardCommuteCard } from '@/features/dashboard/dashboard-commute-card';
import {
  OrgButtonLink,
  OrgResponsiveIconButtonLink,
} from '@/features/organization/org-button-link';
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
  const [bookingInfo, setBookingInfo] = useState<{
    stopId: string;
    commuteType: CommuteType;
    isFirstStop: boolean;
    isLastStop: boolean;
  } | null>(null);

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
    const key = formatDate(commute.date, 'common:iso');
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
          <OrgResponsiveIconButtonLink
            label={t('dashboard:newCommuteAction')}
            variant="secondary"
            size="sm"
            to="/app/$orgSlug/commutes/new"
          >
            <PlusIcon />
          </OrgResponsiveIconButtonLink>
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
                const key = formatDate(day, 'common:iso');
                const isToday = day.isToday();
                const dayCommutes = commutesByDay.get(key) ?? [];

                return (
                  <div key={key} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold">
                        {isToday
                          ? t('dashboard:today')
                          : formatDate(day, 'dashboard:dayHeader')}
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
                      <Empty className="p-6">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <CalendarIcon />
                          </EmptyMedia>
                          <EmptyTitle className="text-sm">
                            {t('dashboard:noCommutesForDay')}
                          </EmptyTitle>
                        </EmptyHeader>
                      </Empty>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {dayCommutes.map((item) => (
                          <DashboardCommuteCard
                            key={item.id}
                            commute={item}
                            currentUserId={currentUserId}
                            commuteCancel={commuteCancel}
                            bookingCancel={bookingCancel}
                            onBookStop={(stopId, commuteType, options) =>
                              setBookingInfo({
                                stopId,
                                commuteType,
                                ...options,
                              })
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
          isFirstStop={bookingInfo?.isFirstStop ?? false}
          isLastStop={bookingInfo?.isLastStop ?? false}
          open={bookingInfo !== null}
          onOpenChange={(open) => {
            if (!open) setBookingInfo(null);
          }}
        />
      </PageLayoutContent>
    </PageLayout>
  );
};
