import { useQuery } from '@tanstack/react-query';

import { orpc } from '@/lib/orpc/client';

export const NavBadge = () => {
  const { data } = useQuery(
    orpc.booking.pendingRequestCount.queryOptions({
      refetchOnWindowFocus: true,
      refetchInterval: 30_000,
    })
  );

  if (!data?.count) return null;

  return (
    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-negative-500 text-[10px] leading-none font-bold text-white ring-2 ring-white md:size-3 md:text-[8px] dark:ring-neutral-900">
      {data.count > 99 ? '99+' : data.count}
    </span>
  );
};
