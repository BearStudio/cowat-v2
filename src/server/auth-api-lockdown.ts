/**
 * Lockdown of the client-facing better-auth HTTP endpoints for the
 * `organization` and `admin` plugins.
 *
 * We reject inbound HTTP requests hitting those endpoints (see the
 * `hooks.before` in `auth.tsx`). Internal server-side `auth.api.*` calls — the
 * ones our oRPC handlers make — are NOT affected: they carry no `request`
 * object, so the hook lets them through.
 */

const EXTERNALLY_ALLOWED_PATHS = new Set([
  '/organization/accept-invitation',
  '/organization/set-active',
]);

const MANAGED_NAMESPACES = ['/organization/', '/admin/'];

export const isInternalOnlyAuthPath = (path: string): boolean =>
  MANAGED_NAMESPACES.some((namespace) => path.startsWith(namespace)) &&
  !EXTERNALLY_ALLOWED_PATHS.has(path);
