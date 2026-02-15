import { createFileRoute } from '@tanstack/react-router';

import { PageOrganization } from '@/features/organization/manager/page-organization';

export const Route = createFileRoute('/manager/$orgSlug/organizations/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageOrganization params={params} />;
}
