import { RequestStatus } from '@/server/db/generated/enums';

type CommuteWithPassengers = {
  driver: { id: string };
  stops: Array<{
    passengers: Array<{
      status: RequestStatus;
      passenger: { id: string };
    }>;
  }>;
};

export type UserBookingStatus = RequestStatus | 'OUTSIDER' | 'DRIVER';

export function getUserBookingStatus(
  commute: CommuteWithPassengers,
  currentUserId: string
): UserBookingStatus {
  if (currentUserId === commute.driver.id) return 'DRIVER';

  const userBooking = commute.stops
    .flatMap((s) => s.passengers)
    .find((p) => p.passenger.id === currentUserId);

  return userBooking?.status ?? 'OUTSIDER';
}
