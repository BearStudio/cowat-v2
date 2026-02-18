import type { Meta } from '@storybook/react-vite';

import { CardCommuteStopsList } from '@/features/commute/card-commute-stops-list';
import { StopEnriched } from '@/features/commute/schema';

export default {
  title: 'Feature/Commute/CardCommuteStopsList',
} satisfies Meta;

const makeStop = (
  overrides: Partial<StopEnriched> &
    Pick<StopEnriched, 'id' | 'outwardTime'> & {
      locationName: string;
    }
): StopEnriched => ({
  order: 0,
  locationId: overrides.id,
  commuteId: 'commute-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  location: { id: overrides.id, name: overrides.locationName },
  passengers: [],
  inwardTime: null,
  ...overrides,
});

export const Default = () => {
  return (
    <CardCommuteStopsList
      stops={[
        makeStop({
          id: '1',
          locationName: 'Gare de Lyon',
          outwardTime: '08:00',
          inwardTime: '18:00',
        }),
        makeStop({
          id: '2',
          locationName: 'La Défense',
          outwardTime: '08:30',
          inwardTime: '17:30',
        }),
      ]}
    />
  );
};

export const OneWay = () => {
  return (
    <CardCommuteStopsList
      stops={[
        makeStop({
          id: '1',
          locationName: 'Gare de Lyon',
          outwardTime: '08:00',
        }),
        makeStop({
          id: '2',
          locationName: 'La Défense',
          outwardTime: '08:30',
        }),
      ]}
    />
  );
};

export const SingleStop = () => {
  return (
    <CardCommuteStopsList
      stops={[
        makeStop({
          id: '1',
          locationName: 'Place de la République',
          outwardTime: '07:45',
          inwardTime: '18:15',
        }),
      ]}
    />
  );
};

export const Empty = () => {
  return <CardCommuteStopsList stops={[]} />;
};
