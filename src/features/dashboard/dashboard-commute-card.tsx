import { UseMutationResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

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
import { CardCommutePassengersList } from '@/features/commute/card-commute-passengers-list';
import { CardCommuteStopsList } from '@/features/commute/card-commute-stops-list';
import { getCommutePassengerStats } from '@/features/commute/commute-passengers';
import { CommuteEnriched, StopEnriched } from '@/features/commute/schema';

type DashboardCommuteCardProps = {
  commute: CommuteEnriched;
  currentUserId: string;
  commuteCancel: UseMutationResult<void, unknown, { id: string }>;
  bookingCancel: UseMutationResult<void, unknown, { id: string }>;
  onBookStop: (stopId: string) => void;
};

export const DashboardCommuteCard = ({
  commute,
  currentUserId,
  commuteCancel,
  bookingCancel,
  onBookStop,
}: DashboardCommuteCardProps) => {
  const { t } = useTranslation(['dashboard', 'commute', 'common']);

  const { outwardPassengers, inwardPassengers, acceptedPassengers } =
    getCommutePassengerStats(commute);

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

  return (
    <CardCommute bookingStatus={bookingStatus}>
      <CardCommuteTrigger>
        <CardCommuteHeader
          driver={commute.driver}
          date={commute.date}
          type={commute.type}
          totalSeats={commute.seats}
          outwardAvailable={commute.seats - outwardPassengers.size}
          inwardAvailable={
            commute.type === 'ROUND'
              ? commute.seats - inwardPassengers.size
              : undefined
          }
          badge={bookingStatus && <BookingStatusBadge status={bookingStatus} />}
        />
      </CardCommuteTrigger>
      <CardCommuteContent>
        <div className="flex flex-col gap-2">
          {commute.comment && (
            <p className="text-sm text-muted-foreground">{commute.comment}</p>
          )}
          <CardCommuteStopsList
            stops={commute.stops}
            renderActions={(stop) => {
              if (isDriver) return null;
              const enrichedStop = stop as StopEnriched;
              const userBooking = enrichedStop.passengers?.find(
                (p) =>
                  p.passenger.id === currentUserId &&
                  (p.status === 'REQUESTED' || p.status === 'ACCEPTED')
              );
              if (userBooking) {
                return (
                  <div className="flex items-center gap-1.5">
                    <Badge
                      size="xs"
                      variant={
                        userBooking.status === 'ACCEPTED'
                          ? 'positive'
                          : 'warning'
                      }
                    >
                      {t(
                        `dashboard:booking.status.${userBooking.status as 'REQUESTED' | 'ACCEPTED'}`
                      )}
                    </Badge>
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
                      <Button size="xs" variant="destructive">
                        {t('common:actions.cancel')}
                      </Button>
                    </ConfirmResponsiveDrawer>
                  </div>
                );
              }
              if (hasBookingOnCommute) return null;
              return (
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => onBookStop(stop.id)}
                >
                  {t('dashboard:booking.submitButton')}
                </Button>
              );
            }}
          />
          <CardCommutePassengersList
            passengers={[...acceptedPassengers.values()]}
          />
          <CardCommuteActions
            isDriver={isDriver}
            driverPhone={commute.driver.phone}
            cancelConfirmDescription={t(
              hasPassengers
                ? 'dashboard:cancelCommute.confirmDescriptionWithPassengers'
                : 'dashboard:cancelCommute.confirmDescription'
            )}
            onCancel={() => commuteCancel.mutateAsync({ id: commute.id })}
          />
        </div>
      </CardCommuteContent>
    </CardCommute>
  );
};
