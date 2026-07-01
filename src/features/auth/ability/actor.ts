/**
 * `Actor`: minimal description of "who is acting", built once then passed to
 * the abilities. This module is PURE (no server import) so it stays shareable
 * between the server and the client (isomorphic).
 */
export type Actor = {
  userId: string;
  appRole: string;
  organizationId?: string;
  memberId?: string;
  orgRole?: string;
  sessionToken?: string;
};

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
