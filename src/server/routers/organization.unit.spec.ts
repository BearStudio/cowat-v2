import { call } from '@orpc/server';
import { describe, expect, it, vi } from 'vitest';

import organizationRouter from '@/server/routers/organization';
import {
  mockDb,
  mockGetSession,
  mockHasPermission,
  mockMemberId,
  mockOrganizationId,
  mockUser,
  mockUserHasPermission,
} from '@/server/routers/test-utils';

const { mockCancelInvitation } = vi.hoisted(() => ({
  mockCancelInvitation: vi.fn(),
}));

vi.mock('@/server/auth', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      userHasPermission: (...args: unknown[]) => mockUserHasPermission(...args),
      hasPermission: (...args: unknown[]) => mockHasPermission(...args),
      cancelInvitation: (...args: unknown[]) => mockCancelInvitation(...args),
    },
  },
}));

const defaultMember = {
  id: mockMemberId,
  userId: mockUser.id,
  organizationId: mockOrganizationId,
  role: 'member',
};

const ownerMembership = { ...defaultMember, role: 'owner' };
const adminMembership = { ...defaultMember, role: 'admin' };

const targetMember = {
  id: 'target-member-1',
  userId: 'other-user-1',
  organizationId: mockOrganizationId,
  role: 'member',
};

const mockInvitation = {
  id: 'invitation-1',
  organizationId: mockOrganizationId,
  email: 'invited@example.com',
  status: 'pending',
};

describe('organization router', () => {
  describe('updateMemberRole', () => {
    const input = { memberId: 'target-member-1', role: 'owner' as const };

    // The org RBAC (`member:['update']`) is enforced in-process from the
    // caller's member role, read by the organizationProcedure middleware (call
    // #1). The owner-only rule for assigning owner is `canAssignRole` (no DB).
    // The handler then calls findMemberById (call #2). We reset the queue per
    // test to keep each self-contained.
    const queueMemberFindFirst = (...rows: unknown[]) => {
      mockDb.member.findFirst.mockReset();
      for (const row of rows) {
        mockDb.member.findFirst.mockResolvedValueOnce(row);
      }
    };

    it('should update role when caller is owner and member belongs to org', async () => {
      queueMemberFindFirst(
        ownerMembership, // middleware: RBAC (owner has member:update)
        targetMember // handler: findMemberById
      );
      mockDb.member.update.mockResolvedValue(undefined);

      await expect(
        call(organizationRouter.updateMemberRole, input)
      ).resolves.toBeUndefined();
    });

    it('should throw FORBIDDEN when caller is a regular member', async () => {
      queueMemberFindFirst(defaultMember); // middleware RBAC denies member:update

      await expect(
        call(organizationRouter.updateMemberRole, input)
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should throw NOT_FOUND when target member does not belong to org', async () => {
      queueMemberFindFirst(
        ownerMembership, // middleware RBAC
        null // handler: findMemberById → NOT_FOUND
      );

      await expect(
        call(organizationRouter.updateMemberRole, input)
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should throw FORBIDDEN when admin tries to assign owner role', async () => {
      queueMemberFindFirst(adminMembership); // middleware RBAC; canAssignRole denies owner

      await expect(
        call(organizationRouter.updateMemberRole, {
          memberId: 'target-member-1',
          role: 'owner',
        })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should allow admin to assign member role', async () => {
      queueMemberFindFirst(
        adminMembership, // middleware RBAC
        targetMember // handler: findMemberById
      );
      mockDb.member.update.mockResolvedValue(undefined);

      await expect(
        call(organizationRouter.updateMemberRole, {
          memberId: 'target-member-1',
          role: 'member',
        })
      ).resolves.toBeUndefined();
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(organizationRouter.updateMemberRole, input)
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  describe('cancelInvitation', () => {
    const input = { invitationId: 'invitation-1' };

    // cancelInvitation is now gated by RBAC `invitation:['cancel']`, enforced in
    // the middleware from the caller's role (single member.findFirst call).
    const queueMemberFindFirst = (...rows: unknown[]) => {
      mockDb.member.findFirst.mockReset();
      for (const row of rows) {
        mockDb.member.findFirst.mockResolvedValueOnce(row);
      }
    };

    it('should cancel invitation when caller is owner and invitation belongs to org', async () => {
      queueMemberFindFirst(ownerMembership); // middleware RBAC (owner has invitation:cancel)
      mockDb.invitation.findFirst.mockResolvedValue(mockInvitation);
      mockCancelInvitation.mockResolvedValue(undefined);

      await expect(
        call(organizationRouter.cancelInvitation, input)
      ).resolves.toBeUndefined();
    });

    it('should throw FORBIDDEN when caller is a regular member', async () => {
      queueMemberFindFirst(defaultMember); // middleware RBAC denies invitation:cancel

      await expect(
        call(organizationRouter.cancelInvitation, input)
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });

      expect(mockCancelInvitation).not.toHaveBeenCalled();
    });

    it('should throw NOT_FOUND when invitation does not belong to org', async () => {
      queueMemberFindFirst(ownerMembership); // middleware RBAC
      mockDb.invitation.findFirst.mockResolvedValue(null);

      await expect(
        call(organizationRouter.cancelInvitation, input)
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });

      expect(mockCancelInvitation).not.toHaveBeenCalled();
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(organizationRouter.cancelInvitation, input)
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });
});
