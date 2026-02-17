import type { Meta } from '@storybook/react-vite';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { BookingStatusBadge } from '@/features/booking/booking-status-badge';
import {
  CardCommute,
  CardCommuteContent,
  CardCommuteHeader,
  CardCommuteTrigger,
} from '@/features/commute/card-commute';

export default {
  title: 'Feature/Commute/CardCommute',
} satisfies Meta;

export const Default = () => {
  return (
    <CardCommute>
      <CardCommuteTrigger>
        <CardCommuteHeader
          driver={{ name: 'Alice Martin', image: null }}
          date={new Date('2026-02-14')}
          type="ROUND"
          availableSeats={2}
          totalSeats={4}
        />
      </CardCommuteTrigger>
      <CardCommuteContent>
        <p className="text-sm text-muted-foreground">
          Departure from parking lot B
        </p>
      </CardCommuteContent>
    </CardCommute>
  );
};

export const LeftBorderByStatus = () => {
  return (
    <div className="flex flex-col gap-3">
      <CardCommute bookingStatus="OUTSIDER">
        <CardCommuteTrigger>
          <CardCommuteHeader
            driver={{ name: 'Alice Martin', image: null }}
            date={new Date('2026-02-14')}
            type="ROUND"
            availableSeats={2}
            totalSeats={4}
          />
        </CardCommuteTrigger>
        <CardCommuteContent>
          <p className="text-sm text-muted-foreground">Not involved</p>
        </CardCommuteContent>
      </CardCommute>
      <CardCommute bookingStatus="DRIVER">
        <CardCommuteTrigger>
          <CardCommuteHeader
            driver={{ name: 'Bob Dupont', image: null }}
            date={new Date('2026-02-14')}
            type="ROUND"
            badge={<BookingStatusBadge status="DRIVER" />}
            availableSeats={3}
            totalSeats={4}
          />
        </CardCommuteTrigger>
        <CardCommuteContent>
          <p className="text-sm text-muted-foreground">Driver</p>
        </CardCommuteContent>
      </CardCommute>
      <CardCommute bookingStatus="REQUESTED">
        <CardCommuteTrigger>
          <CardCommuteHeader
            driver={{ name: 'Claire Petit', image: null }}
            date={new Date('2026-02-14')}
            type="ROUND"
            availableSeats={3}
            totalSeats={4}
            badge={<BookingStatusBadge status="REQUESTED" />}
          />
        </CardCommuteTrigger>
        <CardCommuteContent>
          <p className="text-sm text-muted-foreground">Passenger — Requested</p>
        </CardCommuteContent>
      </CardCommute>
      <CardCommute bookingStatus="ACCEPTED">
        <CardCommuteTrigger>
          <CardCommuteHeader
            driver={{ name: 'Charlie Durand', image: null }}
            date={new Date('2026-02-14')}
            type="ONEWAY"
            availableSeats={1}
            totalSeats={3}
            badge={<BookingStatusBadge status="ACCEPTED" />}
          />
        </CardCommuteTrigger>
        <CardCommuteContent>
          <p className="text-sm text-muted-foreground">Passenger — Accepted</p>
        </CardCommuteContent>
      </CardCommute>
      <CardCommute bookingStatus="REFUSED">
        <CardCommuteTrigger>
          <CardCommuteHeader
            driver={{ name: 'Diana Moreau', image: null }}
            date={new Date('2026-02-15')}
            type="ROUND"
            availableSeats={2}
            totalSeats={4}
            badge={<BookingStatusBadge status="REFUSED" />}
          />
        </CardCommuteTrigger>
        <CardCommuteContent>
          <p className="text-sm text-muted-foreground">Passenger — Refused</p>
        </CardCommuteContent>
      </CardCommute>
      <CardCommute bookingStatus="CANCELED">
        <CardCommuteTrigger>
          <CardCommuteHeader
            driver={{ name: 'Eve Lambert', image: null }}
            date={new Date('2026-02-15')}
            type="ONEWAY"
            availableSeats={0}
            totalSeats={2}
            badge={<BookingStatusBadge status="CANCELED" />}
          />
        </CardCommuteTrigger>
        <CardCommuteContent>
          <p className="text-sm text-muted-foreground">Passenger — Canceled</p>
        </CardCommuteContent>
      </CardCommute>
    </div>
  );
};

export const WithActions = () => {
  return (
    <CardCommute>
      <CardCommuteTrigger>
        <CardCommuteHeader
          driver={{ name: 'Alice Martin', image: null }}
          date={new Date('2026-02-14')}
          type="ROUND"
          availableSeats={2}
          totalSeats={4}
          actions={
            <div onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon-sm">
                <Trash2 />
              </Button>
            </div>
          }
        />
      </CardCommuteTrigger>
      <CardCommuteContent>
        <p className="text-sm text-muted-foreground">
          Departure from parking lot B
        </p>
      </CardCommuteContent>
    </CardCommute>
  );
};
