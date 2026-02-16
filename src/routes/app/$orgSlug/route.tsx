import { createFileRoute, Outlet } from '@tanstack/react-router';

import { GuardOrganization } from '@/features/organization/guard-organization';
import { Layout } from '@/layout/app/layout';

export const Route = createFileRoute('/app/$orgSlug')({
  component: RouteComponent,
});

function RouteComponent() {
  const { orgSlug } = Route.useParams();
  return (
    <GuardOrganization orgSlug={orgSlug}>
      <Layout>
        <Outlet />
      </Layout>
    </GuardOrganization>
  );
}
