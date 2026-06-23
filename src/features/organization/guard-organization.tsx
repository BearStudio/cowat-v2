import { useNavigate } from '@tanstack/react-router';
import { ReactNode, useEffect, useMemo } from 'react';

import { PageError } from '@/components/errors/page-error';
import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';
import {
  OrganizationPermission,
  Permission,
} from '@/features/auth/permissions';
import { checkAppPermission, checkOrgPermission } from '@/features/auth/rbac';
import { PageNoOrganization } from '@/features/organization/page-no-organization';
import { useOrganizations } from '@/features/organization/use-organizations';

export const GuardOrganization = ({
  orgSlug,
  organizationPermission,
  appPermission,
  children,
}: {
  orgSlug?: string;
  organizationPermission?: OrganizationPermission;
  /**
   * App-level permission that also grants access to this org screen, in
   * addition to `organizationPermission`. Access is granted if EITHER passes.
   * Declared per-route so the policy is visible at the call site instead of
   * hardcoded here.
   *
   * UI affordance only: the server's `organizationProcedure` authorizes every
   * request on its own and does NOT grant app roles any org permission.
   */
  appPermission?: Permission;
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
    if (appPermission && checkAppPermission(userRole, appPermission)) {
      return true;
    }
    return checkOrgPermission(targetOrg.role, organizationPermission);
  }, [
    organizationPermission,
    appPermission,
    targetOrg,
    session.data?.user.role,
  ]);

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
