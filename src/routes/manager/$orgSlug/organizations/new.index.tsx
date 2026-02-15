import { createFileRoute } from '@tanstack/react-router';

import { PageOrganizationNew } from '@/features/organization/manager/page-organization-new';

export const Route = createFileRoute('/manager/$orgSlug/organizations/new/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageOrganizationNew />;
}
