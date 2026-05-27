import { createFileRoute, Outlet } from '@tanstack/react-router';

import { orpc } from '@/lib/orpc/client';

import { GuardOrganization } from '@/features/organization/guard-organization';
import { Layout } from '@/layout/manager/layout';

export const Route = createFileRoute('/manager/$orgSlug')({
  loader: ({ context, params }) => {
    context.queryClient.prefetchQuery(
      orpc.organization.getActiveOrganization.queryOptions({
        input: { slug: params.orgSlug },
      })
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { orgSlug } = Route.useParams();
  return (
    <GuardOrganization
      orgSlug={orgSlug}
      organizationPermission={{ organization: ['delete'] }}
    >
      <Layout orgSlug={orgSlug}>
        <Outlet />
      </Layout>
    </GuardOrganization>
  );
}
