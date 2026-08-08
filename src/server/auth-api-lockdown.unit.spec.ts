import { describe, expect, it } from 'vitest';

import { isInternalOnlyAuthPath } from '@/server/auth-api-lockdown';

describe('auth-api-lockdown — isInternalOnlyAuthPath', () => {
  it('blocks organization management endpoints (re-implemented by oRPC)', () => {
    expect(isInternalOnlyAuthPath('/organization/create')).toBe(true);
    expect(isInternalOnlyAuthPath('/organization/update')).toBe(true);
    expect(isInternalOnlyAuthPath('/organization/delete')).toBe(true);
    expect(isInternalOnlyAuthPath('/organization/invite-member')).toBe(true);
    expect(isInternalOnlyAuthPath('/organization/remove-member')).toBe(true);
    expect(isInternalOnlyAuthPath('/organization/update-member-role')).toBe(
      true
    );
    expect(isInternalOnlyAuthPath('/organization/cancel-invitation')).toBe(
      true
    );
  });

  it('blocks all admin plugin endpoints', () => {
    expect(isInternalOnlyAuthPath('/admin/set-role')).toBe(true);
    expect(isInternalOnlyAuthPath('/admin/remove-user')).toBe(true);
    expect(isInternalOnlyAuthPath('/admin/create-user')).toBe(true);
    expect(isInternalOnlyAuthPath('/admin/impersonate-user')).toBe(true);
    expect(isInternalOnlyAuthPath('/admin/list-users')).toBe(true);
  });

  it('allows the endpoints the browser still needs directly', () => {
    expect(isInternalOnlyAuthPath('/organization/accept-invitation')).toBe(
      false
    );
    expect(isInternalOnlyAuthPath('/organization/set-active')).toBe(false);
  });

  it('does not touch core auth endpoints (session, OTP, sign-out)', () => {
    expect(isInternalOnlyAuthPath('/sign-in/email-otp')).toBe(false);
    expect(isInternalOnlyAuthPath('/get-session')).toBe(false);
    expect(isInternalOnlyAuthPath('/sign-out')).toBe(false);
    expect(isInternalOnlyAuthPath('/ok')).toBe(false);
  });

  it('does not match namespace prefixes on unrelated paths', () => {
    expect(isInternalOnlyAuthPath('/organizations-export')).toBe(false);
    expect(isInternalOnlyAuthPath('/administrate')).toBe(false);
  });
});
