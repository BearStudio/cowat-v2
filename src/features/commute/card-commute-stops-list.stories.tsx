import type { Meta } from '@storybook/react-vite';

import { CardCommuteStopsList } from '@/features/commute/card-commute-stops-list';

export default {
  title: 'Feature/Commute/CardCommuteStopsList',
} satisfies Meta;

export const Default = () => {
  return (
    <CardCommuteStopsList
      stops={[
        {
          id: '1',
          location: { name: 'Gare de Lyon' },
          outwardTime: '08:00',
          inwardTime: '18:00',
        },
        {
          id: '2',
          location: { name: 'La Défense' },
          outwardTime: '08:30',
          inwardTime: '17:30',
        },
      ]}
    />
  );
};

export const OneWay = () => {
  return (
    <CardCommuteStopsList
      stops={[
        {
          id: '1',
          location: { name: 'Gare de Lyon' },
          outwardTime: '08:00',
          inwardTime: null,
        },
        {
          id: '2',
          location: { name: 'La Défense' },
          outwardTime: '08:30',
          inwardTime: null,
        },
      ]}
    />
  );
};

export const SingleStop = () => {
  return (
    <CardCommuteStopsList
      stops={[
        {
          id: '1',
          location: { name: 'Place de la République' },
          outwardTime: '07:45',
          inwardTime: '18:15',
        },
      ]}
    />
  );
};

export const Empty = () => {
  return <CardCommuteStopsList stops={[]} />;
};
