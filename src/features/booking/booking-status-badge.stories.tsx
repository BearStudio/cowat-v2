import type { Meta } from '@storybook/react-vite';

import { BookingStatusBadge } from '@/features/booking/booking-status-badge';

export default {
  title: 'Feature/Booking/BookingStatusBadge',
} satisfies Meta;

export const AllStatuses = () => {
  return (
    <div className="flex flex-wrap gap-3">
      <BookingStatusBadge status="DRIVER" />
      <BookingStatusBadge status="REQUESTED" />
      <BookingStatusBadge status="ACCEPTED" />
      <BookingStatusBadge status="REFUSED" />
      <BookingStatusBadge status="CANCELED" />
    </div>
  );
};

export const Driver = () => <BookingStatusBadge status="DRIVER" />;
export const Requested = () => <BookingStatusBadge status="REQUESTED" />;
export const Accepted = () => <BookingStatusBadge status="ACCEPTED" />;
export const Refused = () => <BookingStatusBadge status="REFUSED" />;
export const Canceled = () => <BookingStatusBadge status="CANCELED" />;

export const Outsider = () => (
  <div className="text-sm text-muted-foreground">
    Status <code>OUTSIDER</code> renders nothing:{' '}
    <BookingStatusBadge status="OUTSIDER" />
    (no badge displayed)
  </div>
);
