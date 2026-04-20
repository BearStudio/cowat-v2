import { useNavigate } from '@tanstack/react-router';
import { ReactNode, useEffect, useMemo } from 'react';

import { PageError } from '@/components/errors/page-error';
import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';
import { OrganizationPermission, Role } from '@/features/auth/permissions';
import { PageNoOrganization } from '@/features/organization/page-no-organization';
import { useOrganizations } from '@/features/organization/use-organizations';

export const GuardOrganization = ({
  orgSlug,
  organizationPermission,
  children,
}: {
  orgSlug?: string;
  organizationPermission?: OrganizationPermission;
  children?: ReactNode;
}) => {
  const navigate = useNavigate();
  const session = authClient.useSession();
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
      navigate({ to: '/app', replace: true });
    }
  }, [orgSlug, organizations, targetOrg, navigate]);

  // Check org-level permission
  const hasOrgPermission = useMemo(() => {
    if (!organizationPermission || !targetOrg) return true;
    const userRole = session.data?.user.role;
    if (!userRole) return false;
    // App admins bypass org-level permission checks
    const isAdmin = authClient.admin.checkRolePermission({
      role: userRole as Role,
      permissions: { apps: ['manager'] },
    });
    if (isAdmin) return true;
    return authClient.organization.checkRolePermission({
      role: targetOrg.role as 'owner' | 'admin' | 'member',
      permissions: organizationPermission,
    });
  }, [organizationPermission, targetOrg, session.data?.user.role]);

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

  if (!hasOrgPermission) {
    return <PageError type="403" />;
  }

  return children;
};
