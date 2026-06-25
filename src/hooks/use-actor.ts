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
 * Fail-closed: when unauthenticated (no session user), `actor` is `null`. The
 * app-level identity (`userId`, `appRole`, `sessionToken`) is available as soon
 * as the session loads; the org fields (`memberId`, `orgRole`) stay `undefined`
 * until the active org loads, which makes org-scoped abilities deny in the
 * meantime. Either way, any ability evaluated against a missing identity must
 * deny (see `useCan`).
 *
 * The returned `actor` is memoized on its primitive fields, so its identity is
 * stable across renders. Consumers can safely use it (or the `can` it powers in
 * `useCan`) in dependency arrays without busting their own memoization.
 */
import { useMemo } from 'react';

import { type Actor } from '@/features/auth/ability/actor';
import { authClient } from '@/features/auth/client';

export function useActor(): { actor: Actor | null; isPending: boolean } {
  const session = authClient.useSession();
  const activeOrg = authClient.useActiveOrganization();
  const isPending = session.isPending || activeOrg.isPending;

  const user = session.data?.user;
  const userId = user?.id;
  const appRole = user?.role ?? '';
  const organizationId = activeOrg.data?.id;
  const member = activeOrg.data?.members.find((m) => m.userId === userId);
  const memberId = member?.id;
  const orgRole = member?.role;
  const sessionToken = session.data?.session?.token ?? undefined;

  const actor = useMemo<Actor | null>(
    () =>
      userId
        ? { userId, appRole, organizationId, memberId, orgRole, sessionToken }
        : null,
    [userId, appRole, organizationId, memberId, orgRole, sessionToken]
  );

  return { actor, isPending };
}
