import { describe, expect, it } from 'vitest';

import {
  canActOnMember,
  canAssignRole,
  isCurrentSession,
  isDriverOf,
  isNotCurrentSession,
  isNotOwnCommute,
  isNotSelfByMemberId,
  isNotSelfByUserId,
  isOwnerByMemberId,
  isPassengerOf,
  isRequesterOf,
  isSelfByUserId,
} from '@/features/auth/ability/abilities';
import { type Actor } from '@/features/auth/ability/actor';
import { checkAppPermission, checkOrgPermission } from '@/features/auth/rbac';

const actor = (overrides: Partial<Actor> = {}): Actor => ({
  userId: 'user-1',
  appRole: 'user',
  organizationId: 'org-1',
  memberId: 'member-1',
  orgRole: 'member',
  sessionToken: 'session-1',
  ...overrides,
});

describe('rbac — checkAppPermission', () => {
  it('grants a permission the role owns', () => {
    expect(checkAppPermission('user', { apps: ['app'] })).toBe(true);
  });

  it('denies a permission the role does not own', () => {
    expect(checkAppPermission('user', { apps: ['manager'] })).toBe(false);
  });

  it('grants admin a higher permission', () => {
    expect(checkAppPermission('admin', { apps: ['manager'] })).toBe(true);
  });

  it('is fail-closed when the role is null/empty (no "user" fallback)', () => {
    expect(checkAppPermission(null, { apps: ['app'] })).toBe(false);
    expect(checkAppPermission('', { apps: ['app'] })).toBe(false);
    expect(checkAppPermission(undefined, { apps: ['app'] })).toBe(false);
  });

  it('supports CSV multi-roles', () => {
    expect(checkAppPermission('user,admin', { apps: ['manager'] })).toBe(true);
  });
});

describe('rbac — checkOrgPermission', () => {
  it('grants a member a custom org permission', () => {
    expect(checkOrgPermission('member', { commute: ['create'] })).toBe(true);
  });

  it('denies a member an owner-only permission', () => {
    expect(
      checkOrgPermission('member', { orgNotificationChannel: ['manage'] })
    ).toBe(false);
  });

  it('grants an owner the owner-only permission', () => {
    expect(
      checkOrgPermission('owner', { orgNotificationChannel: ['manage'] })
    ).toBe(true);
  });

  it('is fail-closed when the role is null/empty', () => {
    expect(checkOrgPermission(null, { commute: ['create'] })).toBe(false);
  });
});

describe('abilities — ownership by memberId (isOwnerByMemberId)', () => {
  const can = isOwnerByMemberId(actor({ memberId: 'm-1' }));

  it('NOT_FOUND when resource is absent', () => {
    expect(can(null)).toMatchObject({ ok: false, code: 'NOT_FOUND' });
  });

  it('FORBIDDEN when not the owner', () => {
    expect(can({ memberId: 'm-2' })).toMatchObject({
      ok: false,
      code: 'FORBIDDEN',
    });
  });

  it('allows the owner', () => {
    expect(can({ memberId: 'm-1' })).toEqual({ ok: true });
  });
});

describe('abilities — relations', () => {
  it('isDriverOf: NOT_FOUND / FORBIDDEN / allow', () => {
    const can = isDriverOf(actor({ memberId: 'm-1' }));
    expect(can(null)).toMatchObject({ ok: false, code: 'NOT_FOUND' });
    expect(can({ driverMemberId: 'm-2' })).toMatchObject({
      ok: false,
      code: 'FORBIDDEN',
    });
    expect(can({ driverMemberId: 'm-1' })).toEqual({ ok: true });
  });

  it('isPassengerOf', () => {
    const can = isPassengerOf(actor({ memberId: 'm-1' }));
    expect(can({ passengerMemberId: 'm-1' })).toEqual({ ok: true });
    expect(can({ passengerMemberId: 'm-2' })).toMatchObject({
      ok: false,
      code: 'FORBIDDEN',
    });
  });

  it('isRequesterOf', () => {
    const can = isRequesterOf(actor({ memberId: 'm-1' }));
    expect(can({ requesterMemberId: 'm-1' })).toEqual({ ok: true });
    expect(can({ requesterMemberId: 'm-2' })).toMatchObject({
      ok: false,
      code: 'FORBIDDEN',
    });
  });

  it('isNotOwnCommute keeps the exact message', () => {
    const can = isNotOwnCommute(actor({ memberId: 'm-1' }));
    expect(can({ driverMemberId: 'm-2' })).toEqual({ ok: true });
    expect(can({ driverMemberId: 'm-1' })).toEqual({
      ok: false,
      code: 'FORBIDDEN',
      message: 'Drivers cannot book seats on their own commutes',
    });
  });
});

describe('abilities — self-action prevention', () => {
  it('isNotSelfByUserId', () => {
    const a = actor({ userId: 'u-1' });
    expect(isNotSelfByUserId(a, 'u-1', 'nope')).toEqual({
      ok: false,
      code: 'BAD_REQUEST',
      message: 'nope',
    });
    expect(isNotSelfByUserId(a, 'u-2', 'nope')).toEqual({ ok: true });
  });

  it('isNotSelfByMemberId', () => {
    const a = actor({ memberId: 'm-1' });
    expect(isNotSelfByMemberId(a, 'm-1', 'nope')).toMatchObject({
      ok: false,
      code: 'BAD_REQUEST',
    });
    expect(isNotSelfByMemberId(a, 'm-2', 'nope')).toEqual({ ok: true });
  });

  it('isNotCurrentSession', () => {
    const a = actor({ sessionToken: 's-1' });
    expect(isNotCurrentSession(a, 's-1', 'nope')).toMatchObject({
      ok: false,
      code: 'BAD_REQUEST',
    });
    expect(isNotCurrentSession(a, 's-2', 'nope')).toEqual({ ok: true });
  });
});

describe('abilities — hierarchy (canAssignRole)', () => {
  it('lets an owner assign the owner role', () => {
    expect(canAssignRole(actor({ orgRole: 'owner' }), 'owner')).toEqual({
      ok: true,
    });
  });

  it('forbids a non-owner from assigning the owner role', () => {
    expect(canAssignRole(actor({ orgRole: 'admin' }), 'owner')).toEqual({
      ok: false,
      code: 'FORBIDDEN',
      message: 'Only org owners can assign the owner role',
    });
  });

  it('allows assigning a non-owner role regardless of actor role', () => {
    expect(canAssignRole(actor({ orgRole: 'admin' }), 'member')).toEqual({
      ok: true,
    });
  });

  it('is fail-closed when the actor has no org role', () => {
    expect(canAssignRole(actor({ orgRole: undefined }), 'owner')).toEqual({
      ok: false,
      code: 'FORBIDDEN',
      message: 'Only org owners can assign the owner role',
    });
  });
});

describe('abilities — hierarchy (canActOnMember)', () => {
  it('lets an owner act on another owner', () => {
    expect(canActOnMember(actor({ orgRole: 'owner' }), 'owner')).toEqual({
      ok: true,
    });
  });

  it('forbids a non-owner from acting on an owner', () => {
    expect(canActOnMember(actor({ orgRole: 'admin' }), 'owner')).toEqual({
      ok: false,
      code: 'FORBIDDEN',
      message: 'Only an owner can act on another owner',
    });
  });

  it('lets a non-owner act on a non-owner', () => {
    expect(canActOnMember(actor({ orgRole: 'admin' }), 'member')).toEqual({
      ok: true,
    });
  });

  it('recognises the owner target role inside a CSV role', () => {
    expect(canActOnMember(actor({ orgRole: 'admin' }), 'admin,owner')).toEqual({
      ok: false,
      code: 'FORBIDDEN',
      message: 'Only an owner can act on another owner',
    });
  });

  it('is fail-closed when the actor has no org role and target is owner', () => {
    expect(canActOnMember(actor({ orgRole: undefined }), 'owner')).toEqual({
      ok: false,
      code: 'FORBIDDEN',
      message: 'Only an owner can act on another owner',
    });
  });
});

describe('abilities — client-side self mirrors', () => {
  it('isSelfByUserId is true for the actor, false otherwise', () => {
    const a = actor({ userId: 'u-1' });
    expect(isSelfByUserId(a, 'u-1')).toBe(true);
    expect(isSelfByUserId(a, 'u-2')).toBe(false);
  });

  it('isCurrentSession is true for the actor session, false otherwise', () => {
    const a = actor({ sessionToken: 's-1' });
    expect(isCurrentSession(a, 's-1')).toBe(true);
    expect(isCurrentSession(a, 's-2')).toBe(false);
  });
});
