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

    // The organizationProcedure middleware calls db.member.findFirst once to verify
    // org membership, then the handler calls it twice more (findOwnerMembership,
    // findMemberById). mockResolvedValueOnce values are consumed in order, so we
    // must account for the middleware call first.

    it('should update role when caller is owner and member belongs to org', async () => {
      mockDb.member.findFirst
        .mockResolvedValueOnce(defaultMember) // middleware: org membership check
        .mockResolvedValueOnce(ownerMembership) // handler: findOwnerMembership
        .mockResolvedValueOnce(targetMember); // handler: findMemberById
      mockDb.member.update.mockResolvedValue(undefined);

      await expect(
        call(organizationRouter.updateMemberRole, input)
      ).resolves.toBeUndefined();
    });

    it('should throw FORBIDDEN when caller is not owner or admin', async () => {
      mockDb.member.findFirst
        .mockResolvedValueOnce(defaultMember) // middleware: org membership check
        .mockResolvedValueOnce(null); // handler: findOwnerMembership → FORBIDDEN

      await expect(
        call(organizationRouter.updateMemberRole, input)
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should throw NOT_FOUND when target member does not belong to org', async () => {
      mockDb.member.findFirst
        .mockResolvedValueOnce(defaultMember) // middleware: org membership check
        .mockResolvedValueOnce(ownerMembership) // handler: findOwnerMembership
        .mockResolvedValueOnce(null); // handler: findMemberById → NOT_FOUND

      await expect(
        call(organizationRouter.updateMemberRole, input)
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
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

    it('should cancel invitation when it belongs to the active org', async () => {
      mockDb.invitation.findFirst.mockResolvedValue(mockInvitation);
      mockCancelInvitation.mockResolvedValue(undefined);

      await expect(
        call(organizationRouter.cancelInvitation, input)
      ).resolves.toBeUndefined();
    });

    it('should throw NOT_FOUND when invitation does not belong to org', async () => {
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
