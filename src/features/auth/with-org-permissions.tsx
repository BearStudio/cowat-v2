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

  if (
    props.permissions.every(
      (permission) => !checkOrgPermission(role, permission)
    )
  ) {
    return props.fallback ?? null;
  }

  return props.children;
};
