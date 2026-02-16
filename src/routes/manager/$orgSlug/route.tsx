import { createFileRoute, Outlet } from '@tanstack/react-router';

import { GuardOrganization } from '@/features/organization/guard-organization';
import { Layout } from '@/layout/manager/layout';

export const Route = createFileRoute('/manager/$orgSlug')({
  component: RouteComponent,
});

function RouteComponent() {
  const { orgSlug } = Route.useParams();
  return (
    <GuardOrganization orgSlug={orgSlug} fallbackRedirect="/manager">
      <Layout orgSlug={orgSlug}>
        <Outlet />
      </Layout>
    </GuardOrganization>
  );
}
