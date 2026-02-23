import { UseMutationResult } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { AlertTriangleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '@/lib/dayjs/config';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';

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
import { StopsTimeline } from '@/features/commute/stops-timeline';
import { getCommutePassengerStats } from '@/features/commute/commute-passenger-rules';
import { CommuteEnriched, type CommuteType } from '@/features/commute/schema';

type DashboardCommuteCardProps = {
  commute: CommuteEnriched;
  currentUserId: string;
  commuteCancel: UseMutationResult<void, unknown, { id: string }>;
  bookingCancel: UseMutationResult<void, unknown, { id: string }>;
  onBookStop: (
    stopId: string,
    commuteType: CommuteType,
    options: { isFirstStop: boolean; isLastStop: boolean }
  ) => void;
};

export const DashboardCommuteCard = ({
  commute,
  currentUserId,
  commuteCancel,
  bookingCancel,
  onBookStop,
}: DashboardCommuteCardProps) => {
  const { t } = useTranslation(['dashboard', 'commute', 'common']);

  const { outwardCount, inwardCount, acceptedPassengers } =
    getCommutePassengerStats(commute);

  const stopOrders = commute.stops.map((s) => s.order);
  const minOrder = Math.min(...stopOrders);
  const maxOrder = Math.max(...stopOrders);

  const isDriver = currentUserId === commute.driver.id;
  const bookingStatus = getUserBookingStatus(commute, currentUserId);
  const hasPassengers = acceptedPassengers.size > 0;
  const hasBookingOnCommute = commute.stops.some((s) =>
    s.passengers.some(
      (p) =>
        p.passenger.id === currentUserId &&
        (p.status === 'REQUESTED' || p.status === 'ACCEPTED')
    )
  );

  const outwardFull = outwardCount >= commute.seats;
  const inwardFull = inwardCount >= commute.seats;
  const isFull =
    commute.type === 'ROUND' ? outwardFull && inwardFull : outwardFull;

  return (
    <CardCommute bookingStatus={bookingStatus}>
      <CardCommuteTrigger>
        <CardCommuteHeader
          driver={commute.driver}
          date={commute.date}
          type={commute.type}
          totalSeats={commute.seats}
          outwardAvailable={commute.seats - outwardCount}
          inwardAvailable={
            commute.type === 'ROUND' ? commute.seats - inwardCount : undefined
          }
          outwardDeparture={commute.stops.at(0)?.outwardTime}
          inwardDeparture={commute.stops.at(-1)?.inwardTime ?? undefined}
          passengers={[...acceptedPassengers.values()]}
          badge={bookingStatus && <BookingStatusBadge status={bookingStatus} />}
        />
      </CardCommuteTrigger>
      <CardCommuteContent>
        <div className="flex flex-col gap-2">
          {commute.comment && (
            <p className="text-sm text-muted-foreground">{commute.comment}</p>
          )}
          {isFull && !isDriver && (
            <p className="flex items-center gap-1 text-sm text-warning-600 dark:text-warning-400">
              <AlertTriangleIcon size="1em" className="flex-none" />
              {t('dashboard:booking.fullWarning')}
            </p>
          )}
          <CardCommuteStopsList
            stops={commute.stops}
            renderActions={(stop) => {
              if (isDriver) return null;

              const userBooking = stop.passengers?.find(
                (p) =>
                  p.passenger.id === currentUserId &&
                  (p.status === 'REQUESTED' || p.status === 'ACCEPTED')
              );
              if (userBooking) {
                return (
                  <ConfirmResponsiveDrawer
                    description={t(
                      'dashboard:cancelBooking.confirmDescription'
                    )}
                    confirmText={t('common:actions.delete')}
                    confirmVariant="destructive"
                    onConfirm={() =>
                      bookingCancel.mutateAsync({ id: userBooking.id })
                    }
                  >
                    <Button variant="destructive-secondary" className="w-2/3">
                      {t('common:actions.cancel')}
                    </Button>
                  </ConfirmResponsiveDrawer>
                );
              }
              if (hasBookingOnCommute) return null;
              if (isFull) return null;
              return (
                <Button
                  variant="secondary"
                  className="w-2/3"
                  onClick={() =>
                    onBookStop(stop.id, commute.type, {
                      isFirstStop: stop.order === minOrder,
                      isLastStop: stop.order === maxOrder,
                    })
                  }
                >
                  {t('dashboard:booking.submitButton')}
                </Button>
              );
            }}
          />
          <CardCommuteActions
            isDriver={isDriver}
            driverPhone={commute.driver.phone}
            cancelConfirmDescription={
              <div className="flex flex-col gap-3">
                <span>
                  {t(
                    hasPassengers
                      ? 'dashboard:cancelCommute.confirmDescriptionWithPassengers'
                      : 'dashboard:cancelCommute.confirmDescription'
                  )}
                </span>
                <div className="rounded-md border bg-muted/40 p-3 text-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-medium capitalize">
                      {dayjs(commute.date).f('commute:dayHeader')}
                    </span>
                    <Badge variant="secondary" size="sm">
                      {t(`commute:list.type.${commute.type}`)}
                    </Badge>
                  </div>
                  <StopsTimeline stops={commute.stops} />
                </div>
              </div>
            }
            onCancel={() => commuteCancel.mutateAsync({ id: commute.id })}
          />
        </div>
      </CardCommuteContent>
    </CardCommute>
  );
};
