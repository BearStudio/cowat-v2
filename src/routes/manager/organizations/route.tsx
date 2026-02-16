import { createFileRoute, Outlet } from '@tanstack/react-router';

import { Spinner } from '@/components/ui/spinner';

import { useOrganizations } from '@/features/organization/use-organizations';
import { Layout } from '@/layout/manager/layout';

export const Route = createFileRoute('/manager/organizations')({
  component: RouteComponent,
});

function RouteComponent() {
  const { activeOrg, organizations } = useOrganizations();
  const orgSlug = activeOrg?.slug ?? organizations?.[0]?.slug;

  if (!orgSlug) {
    return <Spinner full className="opacity-60" />;
  }

  return (
    <Layout orgSlug={orgSlug}>
      <Outlet />
    </Layout>
  );
}
