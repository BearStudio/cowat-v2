import { ORPCError } from '@orpc/client';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { z } from 'zod';

import { auth } from '@/server/auth';
import { Prisma } from '@/server/db/generated/client';
import { organizationProcedure, protectedProcedure } from '@/server/orpc';

const tags = ['organizations'];

const zOrganizationListItem = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable(),
  createdAt: z.date(),
  _count: z.object({
    members: z.number(),
  }),
});

export default {
  getAll: protectedProcedure({
    permission: { organization: ['list'] },
  })
    .route({
      method: 'GET',
      path: '/organizations/all',
      tags,
    })
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
      const where = {
        OR: [
          {
            name: {
              contains: input.searchTerm,
              mode: 'insensitive',
            },
          },
          {
            slug: {
              contains: input.searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      } satisfies Prisma.OrganizationWhereInput;

      const [total, items] = await Promise.all([
        context.db.organization.count({ where }),
        context.db.organization.findMany({
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: { name: 'asc' },
          where,
          include: {
            _count: {
              select: { members: true },
            },
          },
        }),
      ]);

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor, total };
    }),

  getById: protectedProcedure({
    permission: { organization: ['list'] },
  })
    .route({
      method: 'GET',
      path: '/organizations/{id}',
      tags,
    })
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
      const org = await context.db.organization.findUnique({
        where: { id: input.id },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, image: true },
              },
            },
          },
          invitations: {
            where: { status: 'pending' },
            select: {
              id: true,
              email: true,
              role: true,
              status: true,
              expiresAt: true,
            },
          },
        },
      });

      if (!org) {
        throw new ORPCError('NOT_FOUND');
      }

      return org;
    }),

  getMyOrganizations: protectedProcedure({ permission: null })
    .route({
      method: 'GET',
      path: '/organizations',
      tags,
    })
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
      const memberships = await context.db.member.findMany({
        where: { userId: context.user.id },
        include: {
          organization: {
            select: { id: true, name: true, slug: true, logo: true },
          },
        },
      });

      return memberships.map((m) => ({
        ...m.organization,
        role: m.role,
      }));
    }),

  getActiveOrganization: organizationProcedure()
    .route({
      method: 'GET',
      path: '/organizations/active',
      tags,
    })
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
      const org = await context.db.organization.findUnique({
        where: { id: context.organizationId },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, image: true },
              },
            },
          },
          invitations: {
            where: { status: 'pending' },
            select: {
              id: true,
              email: true,
              role: true,
              status: true,
              expiresAt: true,
            },
          },
        },
      });

      if (!org) {
        throw new ORPCError('NOT_FOUND');
      }

      return org;
    }),

  create: protectedProcedure({
    permission: { organization: ['create'] },
  })
    .route({
      method: 'POST',
      path: '/organizations',
      tags,
    })
    .input(
      z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(100),
        logo: z.string().nullish(),
        ownerUserId: z.string(),
      })
    )
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
      })
    )
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

  adminInviteMember: protectedProcedure({
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

  inviteMember: organizationProcedure({
    permissions: { invitation: ['create'] },
  })
    .route({
      method: 'POST',
      path: '/organizations/invite',
      tags,
    })
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(['owner', 'member']).prefault('member'),
      })
    )
    .output(z.void())
    .handler(async ({ context, input }) => {
      // Verify user is owner or admin of the org
      const membership = await context.db.member.findFirst({
        where: {
          userId: context.user.id,
          organizationId: context.organizationId,
          role: { in: ['owner', 'admin'] },
        },
      });

      if (!membership) {
        throw new ORPCError('FORBIDDEN', {
          message: 'Only org owners and admins can invite members',
        });
      }

      await auth.api.createInvitation({
        headers: getRequestHeaders(),
        body: {
          email: input.email,
          role: input.role,
          organizationId: context.organizationId,
        },
      });
    }),

  removeMember: organizationProcedure({ permissions: { member: ['delete'] } })
    .route({
      method: 'POST',
      path: '/organizations/remove-member',
      tags,
    })
    .input(z.object({ memberIdOrEmail: z.string() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      // Verify user is owner or admin
      const membership = await context.db.member.findFirst({
        where: {
          userId: context.user.id,
          organizationId: context.organizationId,
          role: { in: ['owner', 'admin'] },
        },
      });

      if (!membership) {
        throw new ORPCError('FORBIDDEN', {
          message: 'Only org owners and admins can remove members',
        });
      }

      // Prevent self-removal
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

  cancelInvitation: organizationProcedure()
    .route({
      method: 'POST',
      path: '/organizations/cancel-invitation',
      tags,
    })
    .input(z.object({ invitationId: z.string() }))
    .output(z.void())
    .handler(async ({ input }) => {
      await auth.api.cancelInvitation({
        headers: getRequestHeaders(),
        body: {
          invitationId: input.invitationId,
        },
      });
    }),

  delete: protectedProcedure({
    permission: { organization: ['delete'] },
  })
    .route({
      method: 'POST',
      path: '/organizations/delete',
      tags,
    })
    .input(z.object({ organizationId: z.string() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      const org = await context.db.organization.findUnique({
        where: { id: input.organizationId },
      });

      if (!org) {
        throw new ORPCError('NOT_FOUND');
      }

      await context.db.organization.delete({
        where: { id: input.organizationId },
      });

      context.logger.info(
        { organizationId: input.organizationId },
        'Organization deleted'
      );
    }),
};
