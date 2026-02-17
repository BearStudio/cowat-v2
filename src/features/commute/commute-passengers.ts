import { CommuteEnriched } from './schema';

export function getCommutePassengerStats(commute: CommuteEnriched) {
  const outwardPassengers = new Set<string>();
  const inwardPassengers = new Set<string>();
  const acceptedPassengers = new Map<
    string,
    { id: string; name?: string | null; image?: string | null }
  >();

  for (const stop of commute.stops) {
    for (const sp of stop.passengers) {
      if (sp.status !== 'ACCEPTED') continue;
      acceptedPassengers.set(sp.passenger.id, sp.passenger);
      if (sp.tripType === 'ROUND' || sp.tripType === 'ONEWAY')
        outwardPassengers.add(sp.passenger.id);
      if (sp.tripType === 'ROUND' || sp.tripType === 'RETURN')
        inwardPassengers.add(sp.passenger.id);
    }
  }

  return { outwardPassengers, inwardPassengers, acceptedPassengers };
}
