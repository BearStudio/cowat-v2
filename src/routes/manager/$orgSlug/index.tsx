import { createFileRoute } from '@tanstack/react-router';

import { orpc } from '@/lib/orpc/client';

import { PageOrganization } from '@/features/organization/manager/page-organization';

export const Route = createFileRoute('/manager/$orgSlug/')({
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(
      orpc.organization.getActiveOrganization.queryOptions()
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <PageOrganization />;
}
