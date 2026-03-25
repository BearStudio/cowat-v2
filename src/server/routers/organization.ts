import { ORPCError } from '@orpc/client';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { z } from 'zod';

import { auth } from '@/server/auth';
import {
  organizationProcedure,
  type OrganizationProcedureArgs,
  protectedProcedure,
  type ProtectedProcedureArgs,
} from '@/server/orpc';
import { createOrganizationRepository } from '@/server/repositories/organization.repository';
import { paginateResult } from '@/server/routers/utils';

const tags = ['organizations'];

const adminProcedure = (args: ProtectedProcedureArgs) =>
  protectedProcedure(args).use(({ context, next }) =>
    next({
      context: { organizations: createOrganizationRepository(context.db) },
    })
  );

const orgProcedure = (args: OrganizationProcedureArgs = {}) =>
  organizationProcedure(args).use(({ context, next }) =>
    next({
      context: { organizations: createOrganizationRepository(context.db) },
    })
  );

const zOrganizationListItem = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable(),
  createdAt: z.date(),
  _count: z.object({ members: z.number() }),
});

export default {
  getAll: adminProcedure({ permission: { organization: ['list'] } })
    .route({ method: 'GET', path: '/organizations/all', tags })
    .input(
      z
        .object({
          cursor: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(100).prefault(20),
          searchTerm: z.string().trim().optional().prefault(''),
        })
        .prefault({})
    )
    .output(
      z.object({
        items: z.array(zOrganizationListItem),
        nextCursor: z.string().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      const [total, items] = await context.organizations.findPaginated({
        searchTerm: input.searchTerm,
        cursor: input.cursor,
        limit: input.limit,
      });

      return paginateResult(total, items, input.limit);
    }),

  getById: adminProcedure({ permission: { organization: ['list'] } })
    .route({ method: 'GET', path: '/organizations/{id}', tags })
    .input(z.object({ id: z.string() }))
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        logo: z.string().nullable(),
        createdAt: z.date(),
        members: z.array(
          z.object({
            id: z.string(),
            role: z.string(),
            user: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
              image: z.string().nullable(),
            }),
          })
        ),
        invitations: z.array(
          z.object({
            id: z.string(),
            email: z.string(),
            role: z.string().nullable(),
            status: z.string(),
            expiresAt: z.date(),
          })
        ),
      })
    )
    .handler(async ({ context, input }) => {
      const org = await context.organizations.findByIdWithDetails(input.id);

      if (!org) {
        throw new ORPCError('NOT_FOUND');
      }

      return org;
    }),

  getMyOrganizations: adminProcedure({ permission: null })
    .route({ method: 'GET', path: '/organizations', tags })
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          slug: z.string(),
          logo: z.string().nullable(),
          role: z.string(),
        })
      )
    )
    .handler(async ({ context }) => {
      const memberships = await context.organizations.findMyMemberships(
        context.user.id
      );
      return memberships.map((m) => ({ ...m.organization, role: m.role }));
    }),

  getActiveOrganization: orgProcedure()
    .route({ method: 'GET', path: '/organizations/active', tags })
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        logo: z.string().nullable(),
        members: z.array(
          z.object({
            id: z.string(),
            role: z.string(),
            user: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
              image: z.string().nullable(),
            }),
          })
        ),
        invitations: z.array(
          z.object({
            id: z.string(),
            email: z.string(),
            role: z.string().nullable(),
            status: z.string(),
            expiresAt: z.date(),
          })
        ),
      })
    )
    .handler(async ({ context }) => {
      const org = await context.organizations.findByIdWithDetails(
        context.organizationId
      );

      if (!org) {
        throw new ORPCError('NOT_FOUND');
      }

      return org;
    }),

  create: adminProcedure({ permission: { organization: ['create'] } })
    .route({ method: 'POST', path: '/organizations', tags })
    .input(
      z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(100),
        logo: z.string().nullish(),
        ownerUserId: z.string(),
      })
    )
    .output(z.object({ id: z.string(), name: z.string(), slug: z.string() }))
    .handler(async ({ context, input }) => {
      const result = await auth.api.createOrganization({
        body: {
          name: input.name,
          slug: input.slug,
          logo: input.logo ?? undefined,
          userId: input.ownerUserId,
        },
      });

      if (!result) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to create organization',
        });
      }

      context.logger.info(
        { organizationId: result.id },
        'Organization created'
      );

      return result;
    }),

  adminInviteMember: adminProcedure({
    permission: { organization: ['create'] },
  })
    .route({
      method: 'POST',
      path: '/organizations/{organizationId}/invite',
      tags,
    })
    .input(
      z.object({
        organizationId: z.string(),
        email: z.string().email(),
        role: z.enum(['owner', 'member']).prefault('member'),
      })
    )
    .output(z.void())
    .handler(async ({ input }) => {
      await auth.api.createInvitation({
        headers: getRequestHeaders(),
        body: {
          email: input.email,
          role: input.role,
          organizationId: input.organizationId,
        },
      });
    }),

  searchUsersToInvite: orgProcedure({
    permissions: { invitation: ['create'] },
  })
    .route({ method: 'GET', path: '/organizations/search-users', tags })
    .input(
      z.object({
        email: z.string().trim().min(2),
        limit: z.coerce.number().int().min(1).max(20).prefault(5),
      })
    )
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
          image: z.string().nullable(),
        })
      )
    )
    .handler(async ({ context, input }) => {
      return context.organizations.searchUsersByEmail({
        email: input.email,
        organizationId: context.organizationId,
        limit: input.limit,
      });
    }),

  inviteMembers: orgProcedure({ permissions: { invitation: ['create'] } })
    .route({ method: 'POST', path: '/organizations/invite-bulk', tags })
    .input(
      z.object({
        emails: z.array(z.string().email()).min(1),
        role: z.enum(['owner', 'member']).prefault('member'),
      })
    )
    .output(
      z.object({
        succeeded: z.array(z.string()),
        failed: z.array(z.object({ email: z.string(), error: z.string() })),
      })
    )
    .handler(async ({ context, input }) => {
      const membership = await context.organizations.findOwnerMembership(
        context.user.id,
        context.organizationId
      );

      if (!membership) {
        throw new ORPCError('FORBIDDEN', {
          message: 'Only org owners and admins can invite members',
        });
      }

      const headers = getRequestHeaders();
      const succeeded: string[] = [];
      const failed: { email: string; error: string }[] = [];

      for (const email of input.emails) {
        try {
          await auth.api.createInvitation({
            headers,
            body: {
              email,
              role: input.role,
              organizationId: context.organizationId,
            },
          });
          succeeded.push(email);
        } catch (e) {
          failed.push({
            email,
            error: e instanceof Error ? e.message : 'Unknown error',
          });
        }
      }

      return { succeeded, failed };
    }),

  removeMember: orgProcedure({ permissions: { member: ['delete'] } })
    .route({ method: 'POST', path: '/organizations/remove-member', tags })
    .input(z.object({ memberIdOrEmail: z.string() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      const membership = await context.organizations.findOwnerMembership(
        context.user.id,
        context.organizationId
      );

      if (!membership) {
        throw new ORPCError('FORBIDDEN', {
          message: 'Only org owners and admins can remove members',
        });
      }

      if (input.memberIdOrEmail === context.user.id) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Cannot remove yourself from the organization',
        });
      }

      await auth.api.removeMember({
        headers: getRequestHeaders(),
        body: {
          memberIdOrEmail: input.memberIdOrEmail,
          organizationId: context.organizationId,
        },
      });
    }),

  updateMemberRole: orgProcedure({ permissions: { member: ['update'] } })
    .route({ method: 'POST', path: '/organizations/update-member-role', tags })
    .input(
      z.object({
        memberId: z.string(),
        role: z.enum(['owner', 'member']),
      })
    )
    .output(z.void())
    .handler(async ({ context, input }) => {
      await context.organizations.updateMemberRole(input.memberId, input.role);
    }),

  cancelInvitation: orgProcedure()
    .route({ method: 'POST', path: '/organizations/cancel-invitation', tags })
    .input(z.object({ invitationId: z.string() }))
    .output(z.void())
    .handler(async ({ input }) => {
      await auth.api.cancelInvitation({
        headers: getRequestHeaders(),
        body: { invitationId: input.invitationId },
      });
    }),

  update: orgProcedure({ permissions: { organization: ['update'] } })
    .route({ method: 'POST', path: '/organizations/update', tags })
    .input(z.object({ name: z.string().min(1).max(100) }))
    .output(z.object({ id: z.string(), name: z.string() }))
    .handler(async ({ context, input }) => {
      const result = await context.organizations.update(
        context.organizationId,
        { name: input.name }
      );

      context.logger.info(
        { organizationId: context.organizationId },
        'Organization updated'
      );

      return result;
    }),

  delete: adminProcedure({ permission: { organization: ['delete'] } })
    .route({ method: 'POST', path: '/organizations/delete', tags })
    .input(z.object({ organizationId: z.string() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      const org = await context.organizations.findById(input.organizationId);

      if (!org) {
        throw new ORPCError('NOT_FOUND');
      }

      await context.organizations.delete(input.organizationId);

      context.logger.info(
        { organizationId: input.organizationId },
        'Organization deleted'
      );
    }),
};
