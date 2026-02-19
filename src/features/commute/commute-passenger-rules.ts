/**
 * Count unique passengers per direction from a flat list of bookings.
 * Shared between frontend (enriched commute) and backend (DB query results).
 */
export function countPassengersByDirection(
  passengers: Array<{ passengerId: string; tripType: string }>
) {
  const outward = new Set<string>();
  const inward = new Set<string>();

  for (const p of passengers) {
    if (p.tripType === 'ROUND' || p.tripType === 'ONEWAY')
      outward.add(p.passengerId);
    if (p.tripType === 'ROUND' || p.tripType === 'RETURN')
      inward.add(p.passengerId);
  }

  return { outwardCount: outward.size, inwardCount: inward.size };
}

/**
 * Check if a trip type is blocked given current seat counts.
 */
export function isTripTypeFull(
  tripType: string,
  seats: number,
  counts: { outwardCount: number; inwardCount: number }
) {
  const outwardFull = counts.outwardCount >= seats;
  const inwardFull = counts.inwardCount >= seats;

  return (
    (tripType === 'ONEWAY' && outwardFull) ||
    (tripType === 'RETURN' && inwardFull) ||
    (tripType === 'ROUND' && (outwardFull || inwardFull))
  );
}

type UserInfo = { id: string; name?: string | null; image?: string | null };

type StopWithPassengers = {
  passengers: Array<{
    status: string;
    tripType: string;
    passenger: UserInfo;
  }>;
};

export function getCommutePassengerStats(commute: {
  stops: Array<StopWithPassengers>;
}) {
  const acceptedPassengers = new Map<string, UserInfo>();
  const flat: Array<{ passengerId: string; tripType: string }> = [];

  for (const stop of commute.stops) {
    for (const sp of stop.passengers) {
      if (sp.status !== 'ACCEPTED') continue;
      acceptedPassengers.set(sp.passenger.id, sp.passenger);
      flat.push({ passengerId: sp.passenger.id, tripType: sp.tripType });
    }
  }

  const { outwardCount, inwardCount } = countPassengersByDirection(flat);

  return { outwardCount, inwardCount, acceptedPassengers };
}
