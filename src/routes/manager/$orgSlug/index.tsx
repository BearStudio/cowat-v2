import { createFileRoute } from '@tanstack/react-router';

import { PageActiveOrganization } from '@/features/organization/manager/page-active-organization';

export const Route = createFileRoute('/manager/$orgSlug/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageActiveOrganization />;
}
