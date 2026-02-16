import { useQuery } from '@tanstack/react-query';

import { orpc } from '@/lib/orpc/client';

import { authClient } from '@/features/auth/client';

export function useOrganizations() {
  const session = authClient.useSession();
  const activeOrgId = session.data?.session?.activeOrganizationId;

  const orgsQuery = useQuery({
    ...orpc.organization.getMyOrganizations.queryOptions(),
    enabled: !!session.data?.user,
  });

  const organizations = orgsQuery.data;
  const activeOrg = organizations?.find((org) => org.id === activeOrgId);

  return {
    organizations,
    activeOrg,
    activeOrgId,
    isPending: orgsQuery.isPending,
  };
}
