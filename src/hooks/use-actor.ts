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
  const activeMember = authClient.useActiveMember();
  const isPending = session.isPending || activeMember.isPending;

  const user = session.data?.user;
  const userId = user?.id;
  const appRole = user?.role ?? '';
  const organizationId = activeMember.data?.organizationId ?? undefined;
  const memberId = activeMember.data?.id ?? undefined;
  const orgRole = activeMember.data?.role ?? undefined;
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
