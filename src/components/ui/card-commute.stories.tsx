import type { Meta } from '@storybook/react-vite';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  CardCommute,
  CardCommuteContent,
  CardCommuteHeader,
  CardCommuteTrigger,
} from '@/components/ui/card-commute';

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
          status="ON_TIME"
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

export const Statuses = () => {
  return (
    <div className="flex flex-col gap-3">
      <CardCommute>
        <CardCommuteTrigger>
          <CardCommuteHeader
            driver={{ name: 'Alice Martin', image: null }}
            date={new Date('2026-02-14')}
            status="ON_TIME"
            type="ROUND"
            availableSeats={2}
            totalSeats={4}
          />
        </CardCommuteTrigger>
      </CardCommute>
      <CardCommute>
        <CardCommuteTrigger>
          <CardCommuteHeader
            driver={{ name: 'Bob Dupont', image: null }}
            date={new Date('2026-02-14')}
            status="DELAYED"
            type="ONEWAY"
            availableSeats={0}
            totalSeats={3}
          />
        </CardCommuteTrigger>
      </CardCommute>
      <CardCommute>
        <CardCommuteTrigger>
          <CardCommuteHeader
            driver={{ name: 'Charlie Durand', image: null }}
            date={new Date('2026-02-15')}
            status="UNKNOWN"
            type="ROUND"
            availableSeats={1}
            totalSeats={2}
          />
        </CardCommuteTrigger>
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
          status="ON_TIME"
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
