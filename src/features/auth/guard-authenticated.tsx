import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { ReactNode, useEffect } from 'react';

import { orpc } from '@/lib/orpc/client';

import { PageError } from '@/components/errors/page-error';
import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';
import { PageOnboarding } from '@/features/auth/page-onboarding';
import { Permission, Role } from '@/features/auth/permissions';
import { PageNoOrganization } from '@/features/organization/page-no-organization';

export const GuardAuthenticated = ({
  children,
  permissionApps,
}: {
  children?: ReactNode;
  permissionApps?: Permission['apps'];
}) => {
  const session = authClient.useSession();
  const router = useRouter();

  const isAuthenticated = !!session.data?.user;
  const isOnboarded = !!session.data?.user?.onboardedAt;

  // Only fetch orgs after user is authenticated and onboarded
  const orgsQuery = useQuery({
    ...orpc.organization.getMyOrganizations.queryOptions(),
    enabled: isAuthenticated && isOnboarded,
  });

  const activeOrgId = session.data?.session?.activeOrganizationId;

  // Auto-set active org if user has orgs but no active one
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

  if (session.isPending) {
    return <Spinner full className="opacity-60" />;
  }

  if (session.error && session.error.status > 0) {
    return <PageError type="unknown-auth-error" />;
  }

  if (!session.data?.user) {
    router.navigate({
      to: '/login',
      replace: true,
      search: {
        redirect: location.href,
      },
    });
    return null;
  }

  // Check if onboarding is done
  if (!session.data.user.onboardedAt) {
    return <PageOnboarding />;
  }

  // Unauthorized if the user permission do not match
  if (
    permissionApps &&
    !authClient.admin.checkRolePermission({
      role: session.data.user.role as Role,
      permission: {
        apps: permissionApps,
      },
    })
  ) {
    return <PageError type="403" />;
  }

  // Wait for orgs query to settle
  if (orgsQuery.isPending) {
    return <Spinner full className="opacity-60" />;
  }

  // User has no organizations
  if (!orgsQuery.data || orgsQuery.data.length === 0) {
    return <PageNoOrganization />;
  }

  // Wait for active org to be set
  if (!activeOrgId) {
    return <Spinner full className="opacity-60" />;
  }

  return <>{children}</>;
};
