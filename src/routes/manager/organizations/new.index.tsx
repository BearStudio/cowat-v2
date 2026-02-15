import { createFileRoute } from '@tanstack/react-router';

import { PageOrganizationNew } from '@/features/organization/manager/page-organization-new';

export const Route = createFileRoute('/manager/organizations/new/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageOrganizationNew />;
}
