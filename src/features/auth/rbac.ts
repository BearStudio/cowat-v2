/**
 * RBAC shared between UI and server.
 *
 * Answers "does this role have this permission?" by reusing the better-auth
 * role definitions (`permissions.ts` / `organization-permissions.ts`).
 * Each role exposes `.authorize(permission)`, a PURE and SYNCHRONOUS function
 * (no network) : this is what allows the RBAC to be evaluated identically on
 * the server AND on the client, without going through the HTTP endpoint
 * `auth.api.userHasPermission`.
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
 * A role can be multiple, stored as CSV by better-auth (e.g. "admin,user").
 * We split it and authorize if AT LEAST ONE of the roles grants the permission.
 *
 * No fallback to a default role: an absent/empty role ⇒ no rights
 * ("fail-closed"). This is the opposite of the former `role ?? 'user'` which
 * silently granted `user` rights (vulnerability #3.5).
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
