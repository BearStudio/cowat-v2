/**
 * Ownership / relation / self-action / hierarchy abilities.
 *
 * These are PURE FUNCTIONS `(actor, resource) => Decision`. They never throw
 * (that is `enforce`'s job, on the server side) so they stay reusable on the
 * client for UI gating.
 */
import { type Actor } from '@/features/auth/ability/actor';

export type DecisionCode = 'NOT_FOUND' | 'FORBIDDEN' | 'BAD_REQUEST';

export type Decision =
  | { ok: true }
  | { ok: false; code: DecisionCode; message?: string };

const allow: Decision = { ok: true };

const deny = (code: DecisionCode, message?: string): Decision => ({
  ok: false,
  code,
  message,
});

// ---------------------------------------------------------------------------
// Family 1 — Resource ownership
// ---------------------------------------------------------------------------

export const isOwnerByMemberId =
  (actor: Actor) =>
  (resource: { memberId: string } | null | undefined): Decision => {
    if (!resource) return deny('NOT_FOUND');
    return resource.memberId === actor.memberId ? allow : deny('FORBIDDEN');
  };

// ---------------------------------------------------------------------------
// Family 2 — Relation abilities
// ---------------------------------------------------------------------------

/** The driver of a commute. */
export const isDriverOf =
  (actor: Actor) =>
  (resource: { driverMemberId: string } | null | undefined): Decision => {
    if (!resource) return deny('NOT_FOUND');
    return resource.driverMemberId === actor.memberId
      ? allow
      : deny('FORBIDDEN');
  };

/** The passenger of a commute. */
export const isPassengerOf =
  (actor: Actor) =>
  (resource: { passengerMemberId: string } | null | undefined): Decision => {
    if (!resource) return deny('NOT_FOUND');
    return resource.passengerMemberId === actor.memberId
      ? allow
      : deny('FORBIDDEN');
  };

/** The requester of a commute. */
export const isRequesterOf =
  (actor: Actor) =>
  (resource: { requesterMemberId: string } | null | undefined): Decision => {
    if (!resource) return deny('NOT_FOUND');
    return resource.requesterMemberId === actor.memberId
      ? allow
      : deny('FORBIDDEN');
  };

/** Prevents the driver from booking a seat on their own commute (`booking.request`). */
export const isNotOwnCommute =
  (actor: Actor) =>
  (resource: { driverMemberId: string } | null | undefined): Decision => {
    if (!resource) return deny('NOT_FOUND');
    return resource.driverMemberId === actor.memberId
      ? deny('FORBIDDEN', 'Drivers cannot book seats on their own commutes')
      : allow;
  };

// ---------------------------------------------------------------------------
// Family 3 — Self-action prevention
// The message is specific to each endpoint : must be passed as a parameter.
// ---------------------------------------------------------------------------

export const isNotSelfByUserId = (
  actor: Actor,
  targetUserId: string,
  message: string
): Decision =>
  actor.userId === targetUserId ? deny('BAD_REQUEST', message) : allow;

export const isNotSelfByMemberId = (
  actor: Actor,
  targetMemberId: string,
  message: string
): Decision =>
  actor.memberId === targetMemberId ? deny('BAD_REQUEST', message) : allow;

export const isNotCurrentSession = (
  actor: Actor,
  sessionToken: string,
  message: string
): Decision =>
  actor.sessionToken === sessionToken ? deny('BAD_REQUEST', message) : allow;

/**
 * Client-side "positive" mirrors of the self-action abilities above. They never need a message, since they don't feed `enforce`.
 */
export const isSelfByUserId = (actor: Actor, targetUserId: string): boolean =>
  !isNotSelfByUserId(actor, targetUserId, '').ok;

export const isCurrentSession = (actor: Actor, sessionToken: string): boolean =>
  !isNotCurrentSession(actor, sessionToken, '').ok;

// ---------------------------------------------------------------------------
// Family 4 — Hierarchy
// Only an owner can act on another owner.
// ---------------------------------------------------------------------------

const hasOrgRole = (actor: Actor, role: string): boolean =>
  (actor.orgRole ?? '').split(',').includes(role);

export const canAssignRole = (actor: Actor, targetRole: string): Decision =>
  targetRole === 'owner' && !hasOrgRole(actor, 'owner')
    ? deny('FORBIDDEN', 'Only org owners can assign the owner role')
    : allow;

export const canActOnMember = (actor: Actor, targetRole: string): Decision =>
  !hasOrgRole(actor, 'owner') && targetRole.split(',').includes('owner')
    ? deny('FORBIDDEN', 'Only an owner can act on another owner')
    : allow;
