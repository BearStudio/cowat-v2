/**
 * `Actor`: minimal description of "who is acting", built once then passed to
 * the abilities. This module is PURE (no server import) so it stays shareable
 * between the server and the client (isomorphic).
 */
export type Actor = {
  userId: string;
  /** Application role ("admin", "user", or CSV "admin,user"). */
  appRole: string;
  /** Present only when an organization is active. */
  organizationId?: string;
  memberId?: string;
  /** Role within the active organization ("owner" | "admin" | "member"). */
  orgRole?: string;
  /** Current session token (for self-action prevention). */
  sessionToken?: string;
};

/**
 * Builds the `Actor` on the server from the oRPC context.
 *
 * The parameter is typed structurally (and not with the oRPC context type) so
 * this pure module does not pull in a server dependency.
 */
export const actorFromContext = (context: {
  user: { id: string; role?: string | null };
  session?: { token?: string | null };
  organizationId?: string;
  memberId?: string;
  orgRole?: string | null;
}): Actor => ({
  userId: context.user.id,
  appRole: context.user.role ?? '',
  organizationId: context.organizationId,
  memberId: context.memberId,
  orgRole: context.orgRole ?? undefined,
  sessionToken: context.session?.token ?? undefined,
});
