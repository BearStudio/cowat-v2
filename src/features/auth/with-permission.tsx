import { ReactNode } from 'react';

import { authClient } from '@/features/auth/client';
import { Permission } from '@/features/auth/permissions';
import { checkAppPermission } from '@/features/auth/rbac';

export const WithPermissions = (props: {
  permissions: Permission[];
  children?: ReactNode;
  loadingFallback?: ReactNode;
  fallback?: ReactNode;
}) => {
  const session = authClient.useSession();
  const userRole = session.data?.user.role;

  if (session.isPending) {
    return props.loadingFallback ?? props.fallback ?? null;
  }

  if (
    props.permissions.every(
      (permission) => !checkAppPermission(userRole, permission)
    )
  ) {
    return props.fallback ?? null;
  }

  return props.children;
};
