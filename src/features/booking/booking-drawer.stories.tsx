import type { Meta } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { BookingDrawer } from '@/features/booking/booking-drawer';

export default {
  title: 'Feature/Booking/BookingDrawer',
} satisfies Meta;

export const RoundMiddleStop = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Round commute — middle stop</Button>
      <BookingDrawer
        stopId="stop-1"
        commuteType="ROUND"
        isFirstStop={false}
        isLastStop={false}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
};

export const RoundFirstStop = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Round commute — first stop</Button>
      <BookingDrawer
        stopId="stop-1"
        commuteType="ROUND"
        isFirstStop={true}
        isLastStop={false}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
};

export const RoundLastStop = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Round commute — last stop</Button>
      <BookingDrawer
        stopId="stop-1"
        commuteType="ROUND"
        isFirstStop={false}
        isLastStop={true}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
};

export const OneWayCommute = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>One-way commute</Button>
      <BookingDrawer
        stopId="stop-1"
        commuteType="ONEWAY"
        isFirstStop={false}
        isLastStop={false}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
};
