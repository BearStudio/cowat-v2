import { createFileRoute } from '@tanstack/react-router';

import { PageOrganization } from '@/features/organization/manager/page-organization';

export const Route = createFileRoute('/manager/$orgSlug/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageOrganization />;
}
