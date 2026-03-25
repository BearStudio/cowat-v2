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

  const userBookings = commute.stops
    .flatMap((s) => s.passengers)
    .filter((p) => p.passenger.id === currentUserId);

  if (userBookings.length === 0) return 'OUTSIDER';

  const priority: Record<RequestStatus, number> = {
    ACCEPTED: 0,
    REQUESTED: 1,
    CANCELED: 2,
    REFUSED: 3,
  };

  return userBookings.reduce((best, current) =>
    priority[current.status] < priority[best.status] ? current : best
  ).status;
}
