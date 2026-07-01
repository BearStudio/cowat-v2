/**
 * RBAC shared between UI and server.
 *
 * Replaces the local "mirror" in `orpc.ts` and the client `checkRolePermission`.
 */
import { organizationPermissions } from '@/features/auth/organization-permissions';
import {
  type OrganizationPermission,
  type Permission,
  permissions as appPermissions,
} from '@/features/auth/permissions';

type AuthorizableRole<TPermission> = {
  authorize: (permission: TPermission) => { success: boolean };
};

/**
 * A role can be multiple, stored as CSV by better-auth.
 * We split it and authorize if AT LEAST ONE of the roles grants the permission.
 */
const someRoleAuthorizes = <TPermission>(
  rolesCsv: string,
  registry: Record<string, AuthorizableRole<TPermission> | undefined>,
  permission: TPermission
): boolean =>
  rolesCsv
    .split(',')
    .filter(Boolean)
    .some(
      (roleName) => registry[roleName]?.authorize(permission).success ?? false
    );

export const checkAppPermission = (
  appRole: string | null | undefined,
  permission: Permission
): boolean =>
  someRoleAuthorizes(
    appRole ?? '',
    appPermissions.roles as Record<string, AuthorizableRole<Permission>>,
    permission
  );

export const checkOrgPermission = (
  orgRole: string | null | undefined,
  permission: OrganizationPermission
): boolean =>
  someRoleAuthorizes(
    orgRole ?? '',
    organizationPermissions.roles as Record<
      string,
      AuthorizableRole<OrganizationPermission>
    >,
    permission
  );
