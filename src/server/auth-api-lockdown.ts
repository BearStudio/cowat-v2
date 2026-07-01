/**
 * Lockdown of the client-facing better-auth HTTP endpoints for the
 * `organization` and `admin` plugins.
 *
 * The application manages organizations, members, invitations and users
 * EXCLUSIVELY through its own oRPC API. That API enforces the RBAC permissions
 * AND the business invariants (`canAssignRole`, `canActOnMember`, …) that
 * better-auth's built-in endpoints know nothing about. If those endpoints stayed
 * exposed, a browser client could call e.g.
 * `authClient.organization.updateMemberRole(...)` or `authClient.admin.setRole(...)`
 * directly and bypass every one of those checks.
 *
 * We therefore reject inbound HTTP requests hitting those endpoints (see the
 * `hooks.before` in `auth.tsx`). Internal server-side `auth.api.*` calls — the
 * ones our oRPC handlers make — are NOT affected: they carry no `request`
 * object, so the hook lets them through.
 */

// Endpoints under the managed namespaces that the browser client legitimately
// still calls directly.
const EXTERNALLY_ALLOWED_PATHS = new Set([
  '/organization/accept-invitation',
  '/organization/set-active',
]);

// Namespaces whose mutating endpoints are re-implemented (and guarded) by oRPC.
const MANAGED_NAMESPACES = ['/organization/', '/admin/'];

export const isInternalOnlyAuthPath = (path: string): boolean =>
  MANAGED_NAMESPACES.some((namespace) => path.startsWith(namespace)) &&
  !EXTERNALLY_ALLOWED_PATHS.has(path);
