import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Navigate } from '@tanstack/react-router';

import { orpc } from '@/lib/orpc/client';

import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';
import { Role } from '@/features/auth/permissions';
import { PageNoOrganization } from '@/features/organization/page-no-organization';

export const Route = createFileRoute('/manager/')({
  component: RouteComponent,
});

function RouteComponent() {
  const session = authClient.useSession();
  const activeOrgId = session.data?.session?.activeOrganizationId;

  const orgsQuery = useQuery({
    ...orpc.organization.getMyOrganizations.queryOptions(),
    enabled: !!session.data?.user,
  });

  if (orgsQuery.isPending || session.isPending) {
    return <Spinner full className="opacity-60" />;
  }

  const orgs = orgsQuery.data;

  if (!orgs || orgs.length === 0) {
    return <PageNoOrganization />;
  }

  // App admins go to /manager/users
  const userRole = session.data?.user.role;
  const isAdmin = userRole
    ? authClient.admin.checkRolePermission({
        role: userRole as Role,
        permission: { apps: ['manager'] },
      })
    : false;

  if (isAdmin) {
    const activeOrg = orgs.find((org) => org.id === activeOrgId);
    const targetOrg = activeOrg ?? orgs[0]!;

    return (
      <Navigate
        to="/manager/$orgSlug"
        replace
        params={{ orgSlug: targetOrg.slug }}
      />
    );
  }

  // Non-admins: find orgs they own (can manage)
  const manageableOrgs = orgs.filter((org) =>
    authClient.organization.checkRolePermission({
      role: org.role as 'owner' | 'admin' | 'member',
      permission: { organization: ['delete'] },
    })
  );

  if (manageableOrgs.length === 0) {
    return <PageNoOrganization />;
  }

  // Redirect to active org if it's manageable, otherwise first manageable org
  const activeOrg = manageableOrgs.find((org) => org.id === activeOrgId);
  const targetOrg = activeOrg ?? manageableOrgs[0]!;

  return (
    <Navigate
      to="/manager/$orgSlug"
      params={{ orgSlug: targetOrg.slug }}
      replace
    />
  );
}
