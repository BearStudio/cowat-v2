/**
 * `useCan`: evaluates a PURE ability (`abilities.ts`) against a resource on the
 * client, for UI gating. It is the ability-equivalent of `WithPermissions` /
 * `WithOrgPermissions` (which gate on RBAC).
 *
 * `can` handles the common curried abilities `(actor) => (resource) => Decision`
 * (Ownership / Relation families: `isDriverOf`, `canMutateOwnedResource`,
 * `isPassengerOf`, `isRequesterOf`, `isOwnerByMemberId`, …) — pass the ability
 * and the resource, get back a boolean.
 */
import { useCallback } from 'react';

import { useActor } from '@/hooks/use-actor';

import { type Decision } from '@/features/auth/ability/abilities';
import { type Actor } from '@/features/auth/ability/actor';

export function useCan() {
  const { actor, isPending } = useActor();

  const can = useCallback(
    <R>(
      ability: (actor: Actor) => (resource: R) => Decision,
      resource: R
    ): boolean => (actor ? ability(actor)(resource).ok : false),
    [actor]
  );

  return { can, actor, isPending };
}
