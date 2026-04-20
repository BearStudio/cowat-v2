import { ReactNode } from 'react';

import { authClient } from '@/features/auth/client';
import { OrganizationPermission } from '@/features/auth/permissions';

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
    role !== 'owner' &&
    (!role ||
      props.permissions.every(
        (permission) =>
          !authClient.organization.checkRolePermission({
            role: role,
            permissions: permission,
          })
      ))
  ) {
    return props.fallback ?? null;
  }

  return props.children;
};
