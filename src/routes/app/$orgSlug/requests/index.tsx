import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { PageRequests } from '@/features/booking/app/page-requests';

const searchSchema = z.object({
  tab: z.enum(['bookings', 'commuteRequests']).optional().catch(undefined),
});

export const Route = createFileRoute('/app/$orgSlug/requests/')({
  component: RouteComponent,
  validateSearch: searchSchema,
});

function RouteComponent() {
  const { tab } = Route.useSearch();
  return <PageRequests tab={tab} />;
}
