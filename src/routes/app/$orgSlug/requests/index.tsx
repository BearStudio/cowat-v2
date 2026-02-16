import { createFileRoute } from '@tanstack/react-router';

import { PageRequests } from '@/features/booking/app/page-requests';

export const Route = createFileRoute('/app/$orgSlug/requests/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageRequests />;
}
