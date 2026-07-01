/**
 * Boundary between the "pure" world (abilities) and the "impure" one (HTTP
 * errors).
 *
 * `enforce` is the ONLY place that turns a negative `Decision` into an
 * `ORPCError`. It is server-only (imports `@orpc/client`). On the client, the
 * `Decision` is used directly (see `useCan`) without ever throwing.
 */
import { ORPCError } from '@orpc/client';

import { type Decision, isDriverOf } from '@/features/auth/ability/abilities';
import { type Actor } from '@/features/auth/ability/actor';

export function enforce(decision: Decision): asserts decision is { ok: true } {
  if (!decision.ok) {
    throw new ORPCError(decision.code, { message: decision.message });
  }
}

export function enforceOwnership<T extends { driverMemberId: string }>(
  actor: Actor,
  resource: T | null | undefined
): asserts resource is T {
  enforce(isDriverOf(actor)(resource));
}
