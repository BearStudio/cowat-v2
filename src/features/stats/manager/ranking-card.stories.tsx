import type { Meta } from '@storybook/react-vite';

import { RankingCard } from '@/features/stats/manager/ranking-card';
import { StatsUser } from '@/features/stats/schema';

export default {
  title: 'Feature/Stats/RankingCard',
} satisfies Meta;

const mockUsers: Array<StatsUser> = [
  {
    id: '1',
    name: 'Alice Martin',
    email: 'alice@example.com',
    image: null,
    commuteCount: 42,
    bookingCount: 15,
    templateCount: 5,
    stopCount: 80,
    showCommutes: true,
    showBookings: true,
    showTemplates: true,
    showStops: true,
  },
  {
    id: '2',
    name: 'Bob Dupont',
    email: 'bob@example.com',
    image: null,
    commuteCount: 35,
    bookingCount: 28,
    templateCount: 3,
    stopCount: 60,
    showCommutes: true,
    showBookings: true,
    showTemplates: true,
    showStops: true,
  },
  {
    id: '3',
    name: 'Charlie Durand',
    email: 'charlie@example.com',
    image: null,
    commuteCount: 20,
    bookingCount: 45,
    templateCount: 8,
    stopCount: 40,
    showCommutes: true,
    showBookings: true,
    showTemplates: true,
    showStops: true,
  },
  {
    id: '4',
    name: 'Diana Moreau',
    email: 'diana@example.com',
    image: null,
    commuteCount: 18,
    bookingCount: 12,
    templateCount: 2,
    stopCount: 35,
    showCommutes: true,
    showBookings: true,
    showTemplates: true,
    showStops: true,
  },
  {
    id: '5',
    name: 'Émile Petit',
    email: 'emile@example.com',
    image: null,
    commuteCount: 10,
    bookingCount: 8,
    templateCount: 1,
    stopCount: 20,
    showCommutes: true,
    showBookings: true,
    showTemplates: true,
    showStops: true,
  },
  {
    id: '6',
    name: 'Fanny Leroy',
    email: 'fanny@example.com',
    image: null,
    commuteCount: 5,
    bookingCount: 3,
    templateCount: 0,
    stopCount: 10,
    showCommutes: true,
    showBookings: true,
    showTemplates: true,
    showStops: true,
  },
];

export const BestDrivers = () => (
  <RankingCard
    title="Best Drivers"
    description="Most commutes created"
    users={mockUsers}
    metricKey="commuteCount"
  />
);

export const BestPassengers = () => (
  <RankingCard
    title="Best Passengers"
    description="Most bookings made"
    users={mockUsers}
    metricKey="bookingCount"
  />
);

export const MostTemplates = () => (
  <RankingCard
    title="Most Templates"
    description="Most commute templates created"
    users={mockUsers}
    metricKey="templateCount"
  />
);

export const FewUsers = () => (
  <RankingCard
    title="Best Drivers"
    description="Most commutes created"
    users={mockUsers.slice(0, 2)}
    metricKey="commuteCount"
  />
);
