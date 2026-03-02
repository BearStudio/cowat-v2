import type { Meta } from '@storybook/react-vite';

import { StopEnriched } from '@/features/commute/schema';
import { CommuteSummary } from '@/features/commute/commute-summary';

export default {
  title: 'Feature/Commute/CommuteSummary',
} satisfies Meta;

const now = new Date();

const makeStop = (
  id: string,
  locationName: string,
  outwardTime: string,
  inwardTime?: string | null
): StopEnriched => ({
  id,
  order: 0,
  outwardTime,
  inwardTime: inwardTime ?? null,
  locationId: id,
  commuteId: 'commute-1',
  createdAt: now,
  updatedAt: now,
  location: { id, name: locationName },
  passengers: [],
});

const driver = {
  id: 'driver-1',
  name: 'Alice Martin',
  image: null,
  phone: null,
};

export const RoundTrip = () => {
  return (
    <CommuteSummary
      date={new Date('2026-02-14')}
      type="ROUND"
      stops={[
        makeStop('1', 'Gare de Lyon', '08:00', '18:00'),
        makeStop('2', 'La Défense', '08:30', '17:30'),
        makeStop('3', 'Versailles', '09:00', '17:00'),
      ]}
      driver={driver}
    />
  );
};

export const OneWay = () => {
  return (
    <CommuteSummary
      date={new Date('2026-02-14')}
      type="ONEWAY"
      stops={[
        makeStop('1', 'Gare de Lyon', '08:00'),
        makeStop('2', 'La Défense', '08:30'),
      ]}
      driver={driver}
    />
  );
};

export const SingleStop = () => {
  return (
    <CommuteSummary
      date={new Date('2026-02-14')}
      type="ROUND"
      stops={[makeStop('1', 'Place de la République', '07:45', '18:15')]}
      driver={driver}
    />
  );
};

export const WithoutDriver = () => {
  return (
    <CommuteSummary
      date={new Date('2026-02-14')}
      type="ROUND"
      stops={[
        makeStop('1', 'Gare de Lyon', '08:00', '18:00'),
        makeStop('2', 'La Défense', '08:30', '17:30'),
      ]}
    />
  );
};
