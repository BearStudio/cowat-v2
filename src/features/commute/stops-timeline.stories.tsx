import type { Meta } from '@storybook/react-vite';

import { Button } from '@/components/ui/button';

import { StopEnriched, StopPassenger } from '@/features/commute/schema';
import { StopsTimeline } from '@/features/commute/stops-timeline';

export default {
  title: 'Feature/Commute/StopsTimeline',
} satisfies Meta;

const now = new Date();

const makeStop = (
  overrides: Pick<StopEnriched, 'id' | 'outwardTime'> & {
    locationName: string;
    inwardTime?: string | null;
    passengers?: StopPassenger[];
  }
): StopEnriched => ({
  order: 0,
  locationId: overrides.id,
  commuteId: 'commute-1',
  createdAt: now,
  updatedAt: now,
  location: { id: overrides.id, name: overrides.locationName },
  passengers: [],
  inwardTime: null,
  ...overrides,
});

export const RoundTrip = () => (
  <StopsTimeline
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
      makeStop({
        id: '3',
        locationName: 'Versailles',
        outwardTime: '09:00',
        inwardTime: '17:00',
      }),
    ]}
  />
);

export const OneWay = () => (
  <StopsTimeline
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

export const SingleStop = () => (
  <StopsTimeline
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

export const WithActions = () => (
  <StopsTimeline
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
    renderActions={() => (
      <Button size="xs" variant="secondary">
        Book
      </Button>
    )}
  />
);

export const WithPassengers = () => (
  <StopsTimeline
    stops={[
      makeStop({
        id: '1',
        locationName: 'Gare de Lyon',
        outwardTime: '08:00',
        inwardTime: '18:00',
        passengers: [
          {
            id: 'b1',
            status: 'ACCEPTED',
            tripType: 'ROUND',
            comment: null,
            passenger: {
              id: 'u1',
              name: 'Alice Martin',
              image: null,
              phone: null,
            },
          },
          {
            id: 'b2',
            status: 'REQUESTED',
            tripType: 'ONEWAY',
            comment: null,
            passenger: {
              id: 'u2',
              name: 'Bob Dupont',
              image: null,
              phone: null,
            },
          },
        ],
      }),
      makeStop({
        id: '2',
        locationName: 'La Défense',
        outwardTime: '08:30',
        inwardTime: '17:30',
        passengers: [
          {
            id: 'b3',
            status: 'ACCEPTED',
            tripType: 'ROUND',
            comment: null,
            passenger: {
              id: 'u3',
              name: 'Claire Moreau',
              image: null,
              phone: null,
            },
          },
        ],
      }),
      makeStop({
        id: '3',
        locationName: 'Versailles',
        outwardTime: '09:00',
        inwardTime: '17:00',
      }),
    ]}
  />
);

export const WithLongNames = () => (
  <div className="max-w-xs">
    <StopsTimeline
      stops={[
        makeStop({
          id: '1',
          locationName: 'Gare de Lyon Part-Dieu — Sortie Vivier Merle',
          outwardTime: '08:00',
          inwardTime: '18:00',
        }),
        makeStop({
          id: '2',
          locationName: 'Aéroport Charles de Gaulle Terminal 2E',
          outwardTime: '09:30',
          inwardTime: '16:30',
        }),
      ]}
      renderActions={() => (
        <Button size="xs" variant="secondary">
          Book
        </Button>
      )}
    />
  </div>
);
