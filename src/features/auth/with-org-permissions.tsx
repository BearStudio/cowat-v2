import { ReactNode } from 'react';

import { authClient } from '@/features/auth/client';
import { OrganizationPermission } from '@/features/auth/permissions';
import { checkOrgPermission } from '@/features/auth/rbac';

export const WithOrgPermissions = (props: {
  permissions: OrganizationPermission[];
  children?: ReactNode;
  loadingFallback?: ReactNode;
  fallback?: ReactNode;
}) => {
  const session = authClient.useSession();
  const activeOrg = authClient.useActiveOrganization();

  if (session.isPending || activeOrg.isPending) {
    return props.loadingFallback ?? props.fallback ?? null;
  }

  const currentUserId = session.data?.user?.id;
  const currentUserMember = activeOrg.data?.members.find(
    (m) => m.userId === currentUserId
  );
  const role = currentUserMember?.role;

  // Same in-process check as the server. No special-casing of `owner`: the
  // owner role already authorizes everything via its role definition, so the
  // previous `role !== 'owner'` bypass (which diverged from the server) is gone.
  if (
    props.permissions.every(
      (permission) => !checkOrgPermission(role, permission)
    )
  ) {
    return props.fallback ?? null;
  }

  return props.children;
};
