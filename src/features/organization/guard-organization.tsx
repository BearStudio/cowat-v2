import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { ReactNode, useEffect } from 'react';

import { orpc } from '@/lib/orpc/client';

import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';
import { PageNoOrganization } from '@/features/organization/page-no-organization';

export const GuardOrganization = ({
  orgSlug,
  children,
}: {
  orgSlug?: string;
  children?: ReactNode;
}) => {
  const navigate = useNavigate();
  const session = authClient.useSession();
  const activeOrgId = session.data?.session?.activeOrganizationId;

  const orgsQuery = useQuery({
    ...orpc.organization.getMyOrganizations.queryOptions(),
    enabled: !!session.data?.user,
  });

  const targetOrg = orgSlug
    ? orgsQuery.data?.find((org) => org.slug === orgSlug)
    : orgsQuery.data?.[0];

  // Set the target org as active if it's not already
  useEffect(() => {
    if (targetOrg && targetOrg.id !== activeOrgId) {
      authClient.organization.setActive({ organizationId: targetOrg.id });
    }
  }, [targetOrg, activeOrgId]);

  // Redirect to /app if slug doesn't match any user org
  useEffect(() => {
    if (orgSlug && orgsQuery.data && !targetOrg) {
      navigate({ to: '/app', replace: true });
    }
  }, [orgSlug, orgsQuery.data, targetOrg, navigate]);

  if (orgsQuery.isPending) {
    return <Spinner full className="opacity-60" />;
  }

  if (!orgsQuery.data || orgsQuery.data.length === 0) {
    return <PageNoOrganization />;
  }

  if (!targetOrg) {
    return <Spinner full className="opacity-60" />;
  }

  if (targetOrg.id !== activeOrgId) {
    return <Spinner full className="opacity-60" />;
  }

  return children;
};
