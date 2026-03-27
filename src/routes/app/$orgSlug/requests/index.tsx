import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { orpc } from '@/lib/orpc/client';

import { PageRequests } from '@/features/booking/app/page-requests';

const searchSchema = z.object({
  tab: z.enum(['bookings', 'commuteRequests']).optional().catch(undefined),
});

export const Route = createFileRoute('/app/$orgSlug/requests/')({
  validateSearch: searchSchema,
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(
      orpc.booking.pendingRequestCount.queryOptions()
    );
    context.queryClient.prefetchQuery(
      orpc.commuteRequest.getAll.queryOptions({ input: { limit: 1 } })
    );
  },
});

function RouteComponent() {
  const { tab } = Route.useSearch();
  return <PageRequests tab={tab} />;
}
