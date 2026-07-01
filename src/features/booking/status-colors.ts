import { RequestStatus } from '@/server/db/generated/enums';

type CommuteWithPassengers = {
  driverMemberId: string;
  stops: Array<{
    passengers: Array<{
      status: RequestStatus;
      passengerMemberId: string;
    }>;
  }>;
};

export type UserBookingStatus = RequestStatus | 'OUTSIDER' | 'DRIVER';

// `currentMemberId` is the actor's org membership id (same axis as the server).
// Undefined when there is no active org / the session is still loading → the
// user matches no driver or passenger and is treated as an OUTSIDER.
export function getUserBookingStatus(
  commute: CommuteWithPassengers,
  currentMemberId: string | undefined
): UserBookingStatus {
  if (currentMemberId === commute.driverMemberId) return 'DRIVER';

  const userBookings = commute.stops.flatMap((s) =>
    s.passengers.filter((p) => p.passengerMemberId === currentMemberId)
  );

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
