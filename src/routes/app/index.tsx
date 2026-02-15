import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { orpc } from '@/lib/orpc/client';

import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';
import { PageNoOrganization } from '@/features/organization/page-no-organization';

export const Route = createFileRoute('/app/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const session = authClient.useSession();
  const activeOrgId = session.data?.session?.activeOrganizationId;

  const orgsQuery = useQuery({
    ...orpc.organization.getMyOrganizations.queryOptions(),
    enabled: !!session.data?.user,
  });

  useEffect(() => {
    if (!orgsQuery.data || orgsQuery.data.length === 0) return;

    const activeOrg = orgsQuery.data.find((org) => org.id === activeOrgId);
    const targetOrg = activeOrg ?? orgsQuery.data[0];

    if (targetOrg) {
      navigate({
        to: '/app/$orgSlug',
        params: { orgSlug: targetOrg.slug },
        replace: true,
      });
    }
  }, [orgsQuery.data, activeOrgId, navigate]);

  if (orgsQuery.isPending) {
    return <Spinner full className="opacity-60" />;
  }

  if (!orgsQuery.data || orgsQuery.data.length === 0) {
    return <PageNoOrganization />;
  }

  return <Spinner full className="opacity-60" />;
}
