import type { Meta } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { BookingDrawer } from '@/features/booking/booking-drawer';

export default {
  title: 'Feature/Booking/BookingDrawer',
} satisfies Meta;

export const Default = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open booking drawer</Button>
      <BookingDrawer stopId="stop-1" open={open} onOpenChange={setOpen} />
    </>
  );
};
