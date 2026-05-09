import { ORPCError, os } from '@orpc/server';
import { type ResponseHeadersPluginContext } from '@orpc/server/plugins';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { Match } from 'effect';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';

import { organizationPermissions } from '@/features/auth/organization-permissions';
import {
  OrganizationPermission,
  Permission,
  permissions as appPermissions,
} from '@/features/auth/permissions';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { Prisma } from '@/server/db/generated/client';
import { logger } from '@/server/logger';
import type { NotificationEvent } from '@/server/notifications';
import { notifier } from '@/server/notifications';
import type { NotifyOrgContext } from '@/server/notifications/types';
import { timingStore } from '@/server/timing-store';

// Local role/permission checks: better-auth's `auth.api.userHasPermission`
// fires an internal request that goes through the same TanStack Start /
// Nitro pipeline that strips POST bodies (see api/auth.$.ts), and ends up
// hanging instead of returning. We mirror the role definitions here in dev
// and prod; the test env still exercises the real endpoint.
//
// Drop the local path (and inline both branches back to a single
// `auth.api.userHasPermission` call) once that internal call returns
// reliably — same condition as the body-forwarding workaround in
// src/routes/api/auth.$.ts being removed.
type AuthorizableRole<TPermission> = {
  authorize: (permission: TPermission) => { success: boolean };
};

const hasAppPermission = ({
  role,
  permission,
}: {
  role: string | null | undefined;
  permission: Permission;
}) => {
  const roleNames = (role ?? 'user').split(',');

  return roleNames.some((roleName) => {
    const authorizableRole = appPermissions.roles[
      roleName as keyof typeof appPermissions.roles
    ] as AuthorizableRole<Permission> | undefined;

    return authorizableRole?.authorize(permission).success ?? false;
  });
};

const hasOrganizationPermissionForRole = ({
  role,
  permission,
}: {
  role: string;
  permission: OrganizationPermission;
}) => {
  return role.split(',').some((roleName) => {
    const authorizableRole = organizationPermissions.roles[
      roleName as keyof typeof organizationPermissions.roles
    ] as AuthorizableRole<OrganizationPermission> | undefined;

    return authorizableRole?.authorize(permission).success ?? false;
  });
};

const shouldUseMockedAuthPermissionApi = import.meta.env.MODE === 'test';

const base = os
  .$context<ResponseHeadersPluginContext>()
  // Auth
  .use(async ({ next, context }) => {
    const start = performance.now();

    const session = await auth.api.getSession({ headers: getRequestHeaders() });

    const duration = performance.now() - start;

    context.resHeaders?.append(
      'Server-Timing',
      `auth;dur=${duration.toFixed(2)}`
    );

    return await next({
      context: {
        user: session?.user,
        session: session?.session,
        db,
      },
    });
  })

  // Logger
  .use(async ({ next, context, procedure, path }) => {
    const start = performance.now();
    const meta = {
      path: path.join('.'),
      type: procedure['~orpc'].route.method,
      requestId: randomUUID(),
      userId: context.user?.id,
    };

    const loggerForMiddleWare = logger.child({ ...meta, scope: 'procedure' });

    loggerForMiddleWare.info('Before');

    try {
      const result = await next({
        context: { logger: loggerForMiddleWare },
      });

      const duration = performance.now() - start;
      loggerForMiddleWare.info({ durationMs: duration }, 'After');
      context.resHeaders?.append(
        'Server-Timing',
        `global;dur=${duration.toFixed(2)}`
      );

      return result;
    } catch (error) {
      const logLevel = (() => {
        if (!(error instanceof ORPCError)) return 'error';
        const errorCode = error.status;
        if (errorCode >= 500) return 'error';
        if (errorCode >= 400) return 'warn';
        if (errorCode >= 300) return 'info';
        return 'error';
      })();

      loggerForMiddleWare[logLevel](error);
      throw error;
    }
  })
  // Notifier
  .use(async ({ next, context }) => {
    return await next({
      context: {
        notify: (event: NotificationEvent, orgContext?: NotifyOrgContext) => {
          return notifier.notify(event, context.logger, orgContext);
        },
      },
    });
  })
  // Middleware to add database Server Timing header
  .use(async ({ next, context }) => {
    return timingStore.run({ prisma: [] }, async () => {
      const result = await next();

      // Add the Server-Timing header if there are timings
      const serverTimingHeader = timingStore
        .getStore()
        ?.prisma.map(
          (timing) =>
            `db-${timing.model}-${timing.operation};dur=${timing.duration.toFixed(2)}`
        )
        .join(', ');

      if (serverTimingHeader) {
        context.resHeaders?.append('Server-Timing', serverTimingHeader);
      }

      return result;
    });
  })
  // Prisma Error Handler
  .use(async ({ next, context }) => {
    try {
      return await next();
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const prismaError = error as Prisma.PrismaClientKnownRequestError;
        throw Match.value(prismaError.code).pipe(
          Match.when('P2002', () => {
            context.logger.warn(
              prismaError.meta,
              `Prisma Error: ${prismaError.code} ${prismaError.message}`
            );
            return new ORPCError('CONFLICT', {
              message: 'Unique constraint violation',
              data: { target: prismaError.meta?.target },
            });
          }),
          Match.when('P2025', () => {
            context.logger.warn(
              prismaError.meta,
              `Prisma Error ${prismaError.code}: ${prismaError.message}`
            );
            return new ORPCError('NOT_FOUND', {
              message: 'Record not found',
            });
          }),
          Match.when('P2003', () => {
            context.logger.error(
              prismaError.meta,
              `Prisma Error ${prismaError.code}: ${prismaError.message}`
            );
            return new ORPCError('BAD_REQUEST', {
              message: 'Foreign key constraint violation',
            });
          }),
          Match.orElse(() => {
            context.logger.error(
              prismaError.meta,
              `Prisma Error ${prismaError.code}: ${prismaError.message}`
            );
            return new ORPCError('INTERNAL_SERVER_ERROR', {
              message: 'Database error',
            });
          })
        );
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        const validationError = error as Prisma.PrismaClientValidationError;
        context.logger.error(
          `Prisma Client Validation Error: ${validationError.message}`
        );
        throw new ORPCError('BAD_REQUEST', {
          message: 'Database validation error',
        });
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Unhandled error',
      });
    }
  });

export const publicProcedure = () => base;

export const protectedProcedure = ({
  permission,
}: {
  permission: Permission | null;
}) =>
  base.use(async ({ context, next }) => {
    const { user, session } = context;

    if (!user || !session) {
      throw new ORPCError('UNAUTHORIZED');
    }

    if (!permission) {
      return await next({
        context: {
          user,
          session,
        },
      });
    }

    if (shouldUseMockedAuthPermissionApi) {
      const userHasPermission = await auth.api.userHasPermission({
        headers: getRequestHeaders(),
        body: {
          userId: user.id,
          permissions: permission,
        },
      });

      if (userHasPermission.error) {
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }

      if (!userHasPermission.success) {
        throw new ORPCError('FORBIDDEN');
      }
    } else if (
      !hasAppPermission({
        role: user.role,
        permission,
      })
    ) {
      throw new ORPCError('FORBIDDEN');
    }

    return await next({
      context: {
        user,
        session,
      },
    });
  });

export const organizationProcedure = ({
  permissions: requiredPermission,
}: {
  permissions?: OrganizationPermission;
} = {}) =>
  protectedProcedure({
    permission: null,
  }).use(async ({ context, next }) => {
    const organizationId = context.session.activeOrganizationId;

    if (!organizationId) {
      throw new ORPCError('FORBIDDEN', {
        message: 'No active organization',
      });
    }

    const member = await context.db.member.findFirst({
      where: { userId: context.user.id, organizationId },
    });

    if (!member) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Not a member of this organization',
      });
    }

    // Check org-level permissions if specified
    if (requiredPermission && shouldUseMockedAuthPermissionApi) {
      const hasPermission = await auth.api.hasPermission({
        headers: getRequestHeaders(),
        body: {
          permissions: requiredPermission,
        },
      });

      if (!hasPermission.success) {
        throw new ORPCError('FORBIDDEN', {
          message: 'Insufficient organization permissions',
        });
      }
    } else if (
      requiredPermission &&
      !hasOrganizationPermissionForRole({
        role: member.role,
        permission: requiredPermission,
      })
    ) {
      throw new ORPCError('FORBIDDEN', {
        message: 'Insufficient organization permissions',
      });
    }

    const organization = await context.db.organization.findUnique({
      where: { id: organizationId },
      select: { slug: true },
    });

    return await next({
      context: {
        organizationId,
        memberId: member.id,
        orgSlug: organization?.slug ?? '',
      },
    });
  });

export type ProtectedProcedureArgs = Parameters<typeof protectedProcedure>[0];
export type OrganizationProcedureArgs = Parameters<
  typeof organizationProcedure
>[0];
