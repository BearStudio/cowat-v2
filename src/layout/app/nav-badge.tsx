import { useQuery } from '@tanstack/react-query';

import { orpc } from '@/lib/orpc/client';

import { CountBadge } from '@/components/count-badge';

const QUERY_OPTS = {
  refetchOnWindowFocus: true,
  refetchInterval: 30_000,
} as const;

export const NavBadge = () => {
  const { data: bookingData } = useQuery(
    orpc.booking.pendingRequestCount.queryOptions(QUERY_OPTS)
  );

  const { data: commuteRequestData } = useQuery(
    orpc.commuteRequest.openCount.queryOptions(QUERY_OPTS)
  );

  const count =
    (bookingData?.count ?? 0) + (commuteRequestData?.count ?? 0) || undefined;

  return <CountBadge count={count} variant="destructive" />;
};
