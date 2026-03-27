import { createFileRoute } from '@tanstack/react-router';

import { PageOrgLocations } from '@/features/location/manager/page-org-locations';

export const Route = createFileRoute('/manager/$orgSlug/locations/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageOrgLocations />;
}
