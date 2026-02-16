import type { Meta } from '@storybook/react-vite';

import { RequestCard } from '@/features/booking/request-card';
import { BookingForDriver } from '@/features/booking/schema';

export default {
  title: 'Feature/Booking/RequestCard',
} satisfies Meta;

const baseRequest: BookingForDriver = {
  id: 'booking-1',
  status: 'REQUESTED',
  stopStatus: 'UNKNOWN',
  tripType: 'ROUND',
  delay: null,
  comment: 'I will be at the usual spot near the entrance.',
  isDeleted: false,
  createdAt: new Date('2025-06-10T08:00:00Z'),
  updatedAt: new Date('2025-06-10T08:00:00Z'),
  passengerMemberId: 'member-1',
  stopId: 'stop-1',
  passenger: { id: 'user-1', name: 'Alice Martin', image: null },
  stop: {
    id: 'stop-1',
    order: 1,
    outwardTime: '07:30',
    inwardTime: '17:00',
    commute: {
      id: 'commute-1',
      date: new Date('2025-06-12'),
      type: 'ROUND',
    },
  },
};

export const Default = () => {
  return <RequestCard request={baseRequest} />;
};

export const OneWay = () => {
  return (
    <RequestCard
      request={{
        ...baseRequest,
        id: 'booking-2',
        tripType: 'ONEWAY',
        comment: null,
        stop: {
          ...baseRequest.stop,
          inwardTime: null,
        },
      }}
    />
  );
};

export const ReturnOnly = () => {
  return (
    <RequestCard
      request={{
        ...baseRequest,
        id: 'booking-3',
        tripType: 'RETURN',
      }}
    />
  );
};

export const WithoutComment = () => {
  return (
    <RequestCard
      request={{
        ...baseRequest,
        id: 'booking-4',
        comment: null,
      }}
    />
  );
};

export const Multiple = () => {
  return (
    <div className="flex flex-col gap-4">
      <RequestCard request={baseRequest} />
      <RequestCard
        request={{
          ...baseRequest,
          id: 'booking-5',
          tripType: 'ONEWAY',
          comment: null,
          passenger: { id: 'user-2', name: 'Bob Dupont', image: null },
          stop: {
            ...baseRequest.stop,
            id: 'stop-2',
            outwardTime: '08:15',
            inwardTime: null,
          },
        }}
      />
      <RequestCard
        request={{
          ...baseRequest,
          id: 'booking-6',
          tripType: 'RETURN',
          comment: 'Running a bit late, will text when ready.',
          passenger: { id: 'user-3', name: 'Charlie Durand', image: null },
          stop: {
            ...baseRequest.stop,
            id: 'stop-3',
            outwardTime: '09:00',
            inwardTime: '18:30',
          },
        }}
      />
    </div>
  );
};
