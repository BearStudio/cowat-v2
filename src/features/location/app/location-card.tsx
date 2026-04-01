import { MapPinIcon } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';

export const LocationMapPreview = ({ address }: { address: string }) => {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  return (
    <iframe
      title={address}
      src={src}
      className="pointer-events-none h-full w-full"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
};

export const LocationCardSkeleton = ({ opacity }: { opacity: number }) => (
  <div
    className="flex flex-col overflow-hidden rounded-lg border bg-white dark:bg-neutral-900"
    style={{ opacity }}
  >
    <div className="relative aspect-[16/9] bg-neutral-100 dark:bg-neutral-800">
      <div className="absolute inset-0 flex items-center justify-center">
        <MapPinIcon className="size-8 animate-pulse text-neutral-300 dark:text-neutral-600" />
      </div>
    </div>
    <div className="flex flex-col gap-2 p-3">
      <Skeleton className="h-4 w-3/5" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  </div>
);
