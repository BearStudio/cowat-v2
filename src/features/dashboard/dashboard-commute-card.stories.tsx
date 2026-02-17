import type { Meta } from '@storybook/react-vite';

import { CommuteEnriched } from '@/features/commute/schema';
import { DashboardCommuteCard } from '@/features/dashboard/dashboard-commute-card';

export default {
  title: 'Feature/Dashboard/DashboardCommuteCard',
} satisfies Meta;

const now = new Date();

const mockStop = (
  id: string,
  order: number,
  passengers: CommuteEnriched['stops'][number]['passengers'] = []
): CommuteEnriched['stops'][number] => ({
  id,
  order,
  outwardTime: '08:00',
  inwardTime: '18:00',
  locationId: `loc-${id}`,
  commuteId: 'commute-1',
  createdAt: now,
  updatedAt: now,
  location: { id: `loc-${id}`, name: `Stop ${order + 1}` },
  passengers,
});

const baseCommute: CommuteEnriched = {
  id: 'commute-1',
  date: now,
  seats: 4,
  type: 'ROUND',
  status: 'UNKNOWN',
  delay: null,
  comment: null,
  driverMemberId: 'member-driver-1',
  createdAt: now,
  updatedAt: now,
  driver: { id: 'driver-1', name: 'Alice Martin', image: null, phone: null },
  stops: [mockStop('stop-1', 0), mockStop('stop-2', 1)],
};

const noop = () => Promise.resolve();
const noopMutation = { mutateAsync: noop } as ExplicitAny;

export const Default = () => {
  return (
    <DashboardCommuteCard
      commute={baseCommute}
      currentUserId="passenger-1"
      commuteCancel={noopMutation}
      bookingCancel={noopMutation}
      onBookStop={noop}
    />
  );
};

export const WithPendingBooking = () => {
  const commute: CommuteEnriched = {
    ...baseCommute,
    stops: [
      mockStop('stop-1', 0, [
        {
          id: 'booking-1',
          status: 'REQUESTED',
          tripType: 'ROUND',
          comment: null,
          passenger: {
            id: 'passenger-1',
            name: 'Bob Dupont',
            image: null,
            phone: null,
          },
        },
      ]),
      mockStop('stop-2', 1),
    ],
  };

  return (
    <DashboardCommuteCard
      commute={commute}
      currentUserId="passenger-1"
      commuteCancel={noopMutation}
      bookingCancel={noopMutation}
      onBookStop={noop}
    />
  );
};

export const WithAcceptedBooking = () => {
  const commute: CommuteEnriched = {
    ...baseCommute,
    stops: [
      mockStop('stop-1', 0, [
        {
          id: 'booking-1',
          status: 'ACCEPTED',
          tripType: 'ROUND',
          comment: null,
          passenger: {
            id: 'passenger-1',
            name: 'Bob Dupont',
            image: null,
            phone: null,
          },
        },
      ]),
      mockStop('stop-2', 1),
    ],
  };

  return (
    <DashboardCommuteCard
      commute={commute}
      currentUserId="passenger-1"
      commuteCancel={noopMutation}
      bookingCancel={noopMutation}
      onBookStop={noop}
    />
  );
};

export const AsDriver = () => {
  return (
    <DashboardCommuteCard
      commute={baseCommute}
      currentUserId="driver-1"
      commuteCancel={noopMutation}
      bookingCancel={noopMutation}
      onBookStop={noop}
    />
  );
};

export const FullSeats = () => {
  const passengers = [
    {
      id: 'b-1',
      status: 'ACCEPTED' as const,
      tripType: 'ROUND' as const,
      comment: null,
      passenger: { id: 'p-1', name: 'Bob Dupont', image: null, phone: null },
    },
    {
      id: 'b-2',
      status: 'ACCEPTED' as const,
      tripType: 'ONEWAY' as const,
      comment: null,
      passenger: {
        id: 'p-2',
        name: 'Charlie Durand',
        image: null,
        phone: null,
      },
    },
    {
      id: 'b-3',
      status: 'ACCEPTED' as const,
      tripType: 'ROUND' as const,
      comment: null,
      passenger: { id: 'p-3', name: 'Diana Moreau', image: null, phone: null },
    },
    {
      id: 'b-4',
      status: 'ACCEPTED' as const,
      tripType: 'RETURN' as const,
      comment: null,
      passenger: { id: 'p-4', name: 'Émile Petit', image: null, phone: null },
    },
  ];

  const commute: CommuteEnriched = {
    ...baseCommute,
    stops: [
      mockStop('stop-1', 0, passengers.slice(0, 2)),
      mockStop('stop-2', 1, passengers.slice(2)),
    ],
  };

  return (
    <DashboardCommuteCard
      commute={commute}
      currentUserId="other-user"
      commuteCancel={noopMutation}
      bookingCancel={noopMutation}
      onBookStop={noop}
    />
  );
};
