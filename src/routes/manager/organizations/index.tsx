import { useQuery } from '@tanstack/react-query';
import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { orpc } from '@/lib/orpc/client';

import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';
import { PageOrganizations } from '@/features/organization/manager/page-organizations';

export const Route = createFileRoute('/manager/organizations/')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      searchTerm: z.string().prefault(''),
    })
  ),
  search: {
    middlewares: [stripSearchParams({ searchTerm: '' })],
  },
});

function RouteComponent() {
  const search = Route.useSearch();
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

  return <PageOrganizations orgSlug={orgSlug} search={search} />;
}
