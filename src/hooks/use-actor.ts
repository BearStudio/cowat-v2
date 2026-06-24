/**
 * `useActor`: builds the client-side `Actor` from the better-auth client, so
 * the PURE abilities (`abilities.ts`) can be evaluated for UI gating with the
 * SAME identities the server uses.
 *
 * The actor carries both axes, because abilities span both:
 * - org-level (`memberId`, `orgRole`) for ownership / relation / hierarchy
 *   checks — `isDriverOf`, `isPassengerOf`, `isRequesterOf`, `canActOnMember`, …
 *   These need an active organization; without one, `memberId`/`orgRole` are
 *   `undefined` and those abilities deny (fail-closed).
 * - app-level (`userId`, `appRole`, `sessionToken`) for self-action checks —
 *   `isNotSelfByUserId`, `isNotCurrentSession` (e.g. the back-office user
 *   manager, which has no active org).
 *
 * The org fields reuse the exact same source as `WithOrgPermissions`: the
 * active organization's member list, matched on `userId`.
 *
 * Fail-closed: while pending or when unauthenticated, `actor` is `null` and any
 * ability evaluated against it must deny (see `useCan`).
 */
import { type Actor } from '@/features/auth/ability/actor';
import { authClient } from '@/features/auth/client';

export function useActor(): { actor: Actor | null; isPending: boolean } {
  const session = authClient.useSession();
  const activeOrg = authClient.useActiveOrganization();
  const isPending = session.isPending || activeOrg.isPending;

  const user = session.data?.user;
  if (!user) {
    return { actor: null, isPending };
  }

  const member = activeOrg.data?.members.find((m) => m.userId === user.id);

  return {
    actor: {
      userId: user.id,
      appRole: user.role ?? '',
      organizationId: activeOrg.data?.id,
      memberId: member?.id,
      orgRole: member?.role,
      sessionToken: session.data?.session?.token ?? undefined,
    },
    isPending,
  };
}
