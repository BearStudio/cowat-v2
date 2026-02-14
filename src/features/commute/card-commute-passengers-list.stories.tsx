import type { Meta } from '@storybook/react-vite';

import { CardCommutePassengersList } from '@/features/commute/card-commute-passengers-list';

export default {
  title: 'Feature/Commute/CardCommutePassengersList',
} satisfies Meta;

export const Default = () => {
  return (
    <CardCommutePassengersList
      passengers={[
        { id: '1', name: 'Alice Martin', image: null },
        { id: '2', name: 'Bob Dupont', image: null },
      ]}
    />
  );
};

export const SinglePassenger = () => {
  return (
    <CardCommutePassengersList
      passengers={[{ id: '1', name: 'Alice Martin', image: null }]}
    />
  );
};

export const GroupedPassengers = () => {
  return (
    <CardCommutePassengersList
      passengers={[
        { id: '1', name: 'Alice Martin', image: null },
        { id: '2', name: 'Bob Dupont', image: null },
        { id: '3', name: 'Charlie Durand', image: null },
      ]}
    />
  );
};

export const GroupedWithOverflow = () => {
  return (
    <CardCommutePassengersList
      passengers={[
        { id: '1', name: 'Alice Martin', image: null },
        { id: '2', name: 'Bob Dupont', image: null },
        { id: '3', name: 'Charlie Durand', image: null },
        { id: '4', name: 'Diana Moreau', image: null },
        { id: '5', name: 'Émile Petit', image: null },
      ]}
    />
  );
};

export const Empty = () => {
  return <CardCommutePassengersList passengers={[]} />;
};
