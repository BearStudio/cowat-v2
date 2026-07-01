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
  const activeMember = authClient.useActiveMember();

  if (activeMember.isPending) {
    return props.loadingFallback ?? props.fallback ?? null;
  }

  const role = activeMember.data?.role;

  if (
    props.permissions.every(
      (permission) => !checkOrgPermission(role, permission)
    )
  ) {
    return props.fallback ?? null;
  }

  return props.children;
};
