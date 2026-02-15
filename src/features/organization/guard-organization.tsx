import { useQuery } from '@tanstack/react-query';
import { ReactNode, useEffect } from 'react';

import { orpc } from '@/lib/orpc/client';

import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';
import { PageNoOrganization } from '@/features/organization/page-no-organization';

const useAutoSetActiveOrg = () => {
  const session = authClient.useSession();
  const activeOrgId = session.data?.session?.activeOrganizationId;

  const orgsQuery = useQuery({
    ...orpc.organization.getMyOrganizations.queryOptions(),
    enabled: !!session.data?.user,
  });

  useEffect(() => {
    if (orgsQuery.data && orgsQuery.data.length > 0 && !activeOrgId) {
      const firstOrg = orgsQuery.data[0];
      if (firstOrg) {
        authClient.organization.setActive({
          organizationId: firstOrg.id,
        });
      }
    }
  }, [orgsQuery.data, activeOrgId]);

  return { orgsQuery, activeOrgId };
};

export const GuardOrganization = ({ children }: { children?: ReactNode }) => {
  const { orgsQuery, activeOrgId } = useAutoSetActiveOrg();

  if (orgsQuery.isPending) {
    return <Spinner full className="opacity-60" />;
  }

  if (!orgsQuery.data || orgsQuery.data.length === 0) {
    return <PageNoOrganization />;
  }

  if (!activeOrgId) {
    return <Spinner full className="opacity-60" />;
  }

  return children;
};
