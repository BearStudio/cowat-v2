import { useQuery } from '@tanstack/react-query';

import { orpc } from '@/lib/orpc/client';

import { CountBadge } from '@/components/count-badge';

export const NavBadge = () => {
  const { data } = useQuery(
    orpc.booking.pendingRequestCount.queryOptions({
      refetchOnWindowFocus: true,
      refetchInterval: 30_000,
    })
  );

  return <CountBadge count={data?.count} variant="destructive" />;
};
