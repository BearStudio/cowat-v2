import type { Meta } from '@storybook/react-vite';

import { ConfirmSummary } from '@/components/confirm-summary';

import { StopEnriched } from '@/features/commute/schema';

export default {
  title: 'Feature/Commute/ConfirmSummary',
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
    <ConfirmSummary
      date={new Date('2026-02-14')}
      typeLabel="Aller-retour"
      stops={[
        makeStop('1', 'Gare de Lyon', '08:00', '18:00'),
        makeStop('2', 'La Défense', '08:30', '17:30'),
        makeStop('3', 'Versailles', '09:00', '17:00'),
      ]}
      user={driver}
    />
  );
};

export const OneWay = () => {
  return (
    <ConfirmSummary
      date={new Date('2026-02-14')}
      typeLabel="Aller simple"
      stops={[
        makeStop('1', 'Gare de Lyon', '08:00'),
        makeStop('2', 'La Défense', '08:30'),
      ]}
      user={driver}
    />
  );
};

export const SingleStop = () => {
  return (
    <ConfirmSummary
      date={new Date('2026-02-14')}
      typeLabel="Aller-retour"
      stops={[makeStop('1', 'Place de la République', '07:45', '18:15')]}
      user={driver}
    />
  );
};

export const WithoutUser = () => {
  return (
    <ConfirmSummary
      date={new Date('2026-02-14')}
      typeLabel="Aller-retour"
      stops={[
        makeStop('1', 'Gare de Lyon', '08:00', '18:00'),
        makeStop('2', 'La Défense', '08:30', '17:30'),
      ]}
    />
  );
};
