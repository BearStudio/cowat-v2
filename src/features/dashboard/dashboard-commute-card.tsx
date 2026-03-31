import { UseMutationResult } from '@tanstack/react-query';
import { AlertTriangleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CommentText } from '@/components/comment-text';
import { ConfirmSummary } from '@/components/confirm-summary';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { getCommutePassengerStats } from '@/features/commute/commute-passenger-rules';
import { CommuteEnriched } from '@/features/commute/schema';

type DashboardCommuteCardProps = {
  commute: CommuteEnriched;
  currentUserId: string;
  commuteCancel: UseMutationResult<void, unknown, { id: string }>;
  bookingCancel: UseMutationResult<void, unknown, { id: string }>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onBookStop: (stopId: string) => void;
};

export const DashboardCommuteCard = ({
  commute,
  currentUserId,
  commuteCancel,
  bookingCancel,
  open,
  onOpenChange,
  onBookStop,
}: DashboardCommuteCardProps) => {
  const { t } = useTranslation(['dashboard', 'commute', 'common']);

  const { outwardCount, inwardCount, acceptedPassengers } =
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

  const outwardFull = outwardCount >= commute.seats;
  const inwardFull = inwardCount >= commute.seats;
  const isFull =
    commute.type === 'ROUND' ? outwardFull && inwardFull : outwardFull;

  const outwardTime = commute.stops.at(0)?.outwardTime;
  const inwardTime = commute.stops.at(-1)?.inwardTime;

  const formattedInwardDeparture =
    inwardTime && outwardTime && inwardTime < outwardTime ? (
      <>
        {inwardTime} <span className="text-xs text-muted-foreground">+1</span>
      </>
    ) : (
      (inwardTime ?? undefined)
    );

  return (
    <CardCommute
      bookingStatus={bookingStatus}
      open={open}
      onOpenChange={onOpenChange}
      data-commute-id={commute.id}
    >
      <CardCommuteTrigger>
        <CardCommuteHeader
          driver={commute.driver}
          type={commute.type}
          totalSeats={commute.seats}
          outwardTaken={outwardCount}
          inwardTaken={commute.type === 'ROUND' ? inwardCount : undefined}
          outwardDeparture={commute.stops.at(0)?.outwardTime}
          inwardDeparture={formattedInwardDeparture}
          stops={commute.stops}
          passengers={[...acceptedPassengers.values()]}
          badge={bookingStatus && <BookingStatusBadge status={bookingStatus} />}
          renderStopActions={
            isDriver
              ? undefined
              : (stopId, { isLast }) => {
                  const stop = commute.stops.find((s) => s.id === stopId);
                  if (!stop) return null;

                  const userBooking = stop.passengers?.find(
                    (p) =>
                      p.passenger.id === currentUserId &&
                      (p.status === 'REQUESTED' || p.status === 'ACCEPTED')
                  );

                  if (userBooking) {
                    return (
                      <div onClick={(e) => e.stopPropagation()}>
                        <ConfirmResponsiveDrawer
                          description={
                            <div className="flex flex-col gap-3">
                              <span>
                                {t(
                                  'dashboard:cancelBooking.confirmDescription'
                                )}
                              </span>
                              <ConfirmSummary
                                user={commute.driver}
                                date={commute.date}
                                typeLabel={t(
                                  `commute:list.type.${commute.type}`
                                )}
                                stops={[stop]}
                              />
                            </div>
                          }
                          confirmText={t('common:actions.confirm')}
                          confirmVariant="destructive"
                          onConfirm={() =>
                            bookingCancel.mutateAsync({ id: userBooking.id })
                          }
                        >
                          <Button
                            variant="destructive-secondary"
                            size="sm"
                            className="mt-2 w-full font-normal tracking-[0.15em] uppercase"
                          >
                            {t('common:actions.cancel')}
                          </Button>
                        </ConfirmResponsiveDrawer>
                      </div>
                    );
                  }

                  if (hasBookingOnCommute) return null;
                  if (isFull) return null;
                  if (commute.type === 'ONEWAY' && isLast) return null;

                  return (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-2 w-full font-normal tracking-[0.15em] uppercase"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookStop(stop.id);
                      }}
                    >
                      {t('dashboard:booking.submitButton')}
                    </Button>
                  );
                }
          }
        />
      </CardCommuteTrigger>
      <CardCommuteContent>
        <div className="flex flex-col gap-3">
          {commute.comment && <CommentText>{commute.comment}</CommentText>}
          {isFull && !isDriver && (
            <Alert variant="warning">
              <AlertTriangleIcon />
              <AlertDescription>
                {t('dashboard:booking.fullWarning')}
              </AlertDescription>
            </Alert>
          )}
          <CardCommuteActions
            isDriver={isDriver}
            commuteId={commute.id}
            driverPhone={commute.driver.phone}
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
                  user={commute.driver}
                  date={commute.date}
                  typeLabel={t(`commute:list.type.${commute.type}`)}
                  stops={commute.stops}
                />
              </div>
            }
            onCancel={() => commuteCancel.mutateAsync({ id: commute.id })}
          />
        </div>
      </CardCommuteContent>
    </CardCommute>
  );
};
