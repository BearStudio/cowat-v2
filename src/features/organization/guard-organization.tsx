import { useNavigate } from '@tanstack/react-router';
import { ReactNode, useEffect } from 'react';

import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';
import { PageNoOrganization } from '@/features/organization/page-no-organization';
import { useOrganizations } from '@/features/organization/use-organizations';

export const GuardOrganization = ({
  orgSlug,
  fallbackRedirect = '/app',
  children,
}: {
  orgSlug?: string;
  fallbackRedirect?: string;
  children?: ReactNode;
}) => {
  const navigate = useNavigate();
  const { organizations, activeOrgId, isPending } = useOrganizations();

  const targetOrg = orgSlug
    ? organizations?.find((org) => org.slug === orgSlug)
    : organizations?.[0];

  // Set the target org as active if it's not already
  useEffect(() => {
    if (targetOrg && targetOrg.id !== activeOrgId) {
      authClient.organization.setActive({ organizationId: targetOrg.id });
    }
  }, [targetOrg, activeOrgId]);

  // Redirect if slug doesn't match any user org
  useEffect(() => {
    if (orgSlug && organizations && !targetOrg) {
      navigate({ to: fallbackRedirect, replace: true });
    }
  }, [orgSlug, organizations, targetOrg, navigate, fallbackRedirect]);

  if (isPending) {
    return <Spinner full className="opacity-60" />;
  }

  if (!organizations || organizations.length === 0) {
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
