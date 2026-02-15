import { getUiState } from '@bearstudio/ui-state';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { CalendarIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button-link';
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
import { ResponsiveIconButtonLink } from '@/components/ui/responsive-icon-button-link';

import { authClient } from '@/features/auth/client';
import { BookingDrawer } from '@/features/booking/booking-drawer';
import { CommuteEnriched } from '@/features/commute/schema';
import { DashboardCommuteCard } from '@/features/dashboard/dashboard-commute-card';
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
                      <h2
                        className={
                          isToday
                            ? 'text-base font-bold'
                            : 'text-sm font-semibold'
                        }
                      >
                        {day.format('dddd DD/MM')}
                      </h2>
                      {isToday && (
                        <Badge variant="positive">{t('dashboard:today')}</Badge>
                      )}
                      <ButtonLink
                        variant="ghost"
                        size={isToday ? 'sm' : 'xs'}
                        className="ml-auto"
                        to="/app/commutes/new"
                        search={{ date: day.toDate() }}
                      >
                        <PlusIcon />
                        {t('dashboard:newCommuteAction')}
                      </ButtonLink>
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
                            onBookStop={setBookingStopId}
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
