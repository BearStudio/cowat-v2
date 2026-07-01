import { call } from '@orpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import organizationRouter from '@/server/routers/organization';
import {
  mockDb,
  mockGetSession,
  mockMemberId,
  mockOrganizationId,
  mockUser,
} from '@/server/routers/test-utils';

const { mockCancelInvitation, mockCreateInvitation } = vi.hoisted(() => ({
  mockCancelInvitation: vi.fn(),
  mockCreateInvitation: vi.fn(),
}));

vi.mock('@/server/auth', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      cancelInvitation: (...args: unknown[]) => mockCancelInvitation(...args),
      createInvitation: (...args: unknown[]) => mockCreateInvitation(...args),
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
  describe('getActiveOrganization', () => {
    const orgDetails = {
      id: mockOrganizationId,
      name: 'Acme',
      slug: 'acme',
      logo: null,
      members: [
        {
          id: 'member-1',
          role: 'member',
          user: {
            id: 'user-1',
            name: 'Alice',
            email: 'alice@example.com',
            image: null,
          },
        },
      ],
      invitations: [
        {
          id: 'invitation-1',
          email: 'invited@example.com',
          role: 'member',
          status: 'pending',
          expiresAt: new Date('2099-01-01'),
        },
      ],
    };

    beforeEach(() => {
      mockDb.member.findFirst.mockReset();
      mockDb.organization.findUnique.mockReset();
      mockDb.organization.findUnique
        .mockResolvedValueOnce({ slug: orgDetails.slug }) // middleware: slug
        .mockResolvedValueOnce(orgDetails); // handler: findByIdWithDetails
    });

    it('should expose members and invitations to an owner', async () => {
      mockDb.member.findFirst.mockResolvedValue(ownerMembership);

      const result = await call(
        organizationRouter.getActiveOrganization,
        undefined
      );

      expect(result.members).toHaveLength(1);
      expect(result.invitations).toHaveLength(1);
    });

    it('should expose members and invitations to an admin', async () => {
      mockDb.member.findFirst.mockResolvedValue(adminMembership);

      const result = await call(
        organizationRouter.getActiveOrganization,
        undefined
      );

      expect(result.members).toHaveLength(1);
      expect(result.invitations).toHaveLength(1);
    });

    it('should NOT leak members or invitations to a regular member', async () => {
      mockDb.member.findFirst.mockResolvedValue(defaultMember);

      const result = await call(
        organizationRouter.getActiveOrganization,
        undefined
      );

      // Minimal org info is still returned…
      expect(result.id).toBe(mockOrganizationId);
      expect(result.name).toBe('Acme');
      // …but manager-only data must be absent.
      expect(result.members).toBeUndefined();
      expect(result.invitations).toBeUndefined();
    });
  });

  describe('updateMemberRole', () => {
    const input = { memberId: 'target-member-1', role: 'owner' as const };

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

    it('should allow admin to promote a member to admin', async () => {
      queueMemberFindFirst(
        adminMembership, // middleware RBAC (admin has member:update)
        targetMember // handler: findMemberById (target is a member)
      );
      mockDb.member.update.mockResolvedValue(undefined);

      await expect(
        call(organizationRouter.updateMemberRole, {
          memberId: 'target-member-1',
          role: 'admin',
        })
      ).resolves.toBeUndefined();
    });

    it('should throw FORBIDDEN when admin tries to change an owner role', async () => {
      queueMemberFindFirst(
        adminMembership, // middleware RBAC
        { ...targetMember, role: 'owner' } // handler: target is an owner
      );

      // canActOnMember: a non-owner cannot act on an existing owner.
      await expect(
        call(organizationRouter.updateMemberRole, {
          memberId: 'target-member-1',
          role: 'admin',
        })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
      expect(mockDb.member.update).not.toHaveBeenCalled();
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(organizationRouter.updateMemberRole, input)
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  describe('inviteMembers', () => {
    beforeEach(() => {
      mockCreateInvitation.mockReset();
      mockCreateInvitation.mockResolvedValue(undefined);
      mockDb.member.findFirst.mockReset();
    });

    it('should throw FORBIDDEN when an admin tries to invite an owner', async () => {
      mockDb.member.findFirst.mockResolvedValue(adminMembership);

      await expect(
        call(organizationRouter.inviteMembers, {
          emails: ['victim@example.com'],
          role: 'owner',
        })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
      expect(mockCreateInvitation).not.toHaveBeenCalled();
    });

    it('should let an owner invite an owner', async () => {
      mockDb.member.findFirst.mockResolvedValue(ownerMembership);

      const result = await call(organizationRouter.inviteMembers, {
        emails: ['new-owner@example.com'],
        role: 'owner',
      });

      expect(result.succeeded).toEqual(['new-owner@example.com']);
      expect(mockCreateInvitation).toHaveBeenCalledTimes(1);
    });

    it('should let an admin invite a regular member', async () => {
      mockDb.member.findFirst.mockResolvedValue(adminMembership);

      const result = await call(organizationRouter.inviteMembers, {
        emails: ['teammate@example.com'],
        role: 'member',
      });

      expect(result.succeeded).toEqual(['teammate@example.com']);
      expect(mockCreateInvitation).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancelInvitation', () => {
    const input = { invitationId: 'invitation-1' };

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
