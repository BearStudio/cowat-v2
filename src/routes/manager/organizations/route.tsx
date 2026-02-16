import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet } from '@tanstack/react-router';

import { orpc } from '@/lib/orpc/client';

import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';
import { Layout } from '@/layout/manager/layout';

export const Route = createFileRoute('/manager/organizations')({
  component: RouteComponent,
});

function RouteComponent() {
  const session = authClient.useSession();
  const activeOrgId = session.data?.session?.activeOrganizationId;

  const orgsQuery = useQuery({
    ...orpc.organization.getMyOrganizations.queryOptions(),
    enabled: !!session.data?.user,
  });

  const activeOrg = orgsQuery.data?.find((org) => org.id === activeOrgId);
  const orgSlug = activeOrg?.slug ?? orgsQuery.data?.[0]?.slug;

  if (!orgSlug) {
    return <Spinner full className="opacity-60" />;
  }

  return (
    <Layout orgSlug={orgSlug}>
      <Outlet />
    </Layout>
  );
}
