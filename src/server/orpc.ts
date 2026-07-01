import { ORPCError, os } from '@orpc/server';
import { type ResponseHeadersPluginContext } from '@orpc/server/plugins';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { Match } from 'effect';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';

import {
  type OrganizationPermission,
  type Permission,
} from '@/features/auth/permissions';
import { checkAppPermission, checkOrgPermission } from '@/features/auth/rbac';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { Prisma } from '@/server/db/generated/client';
import { logger } from '@/server/logger';
import type { NotificationEvent } from '@/server/notifications';
import { notifier } from '@/server/notifications';
import type { NotifyOrgContext } from '@/server/notifications/types';
import { timingStore } from '@/server/timing-store';

// Permission checks run in-process via `checkAppPermission` / `checkOrgPermission`.
// We do NOT use `auth.api.userHasPermission`.
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

    if (!checkAppPermission(user.role, permission)) {
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
    if (
      requiredPermission &&
      !checkOrgPermission(member.role, requiredPermission)
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
        orgRole: member.role,
        orgSlug: organization?.slug ?? '',
      },
    });
  });

export type ProtectedProcedureArgs = Parameters<typeof protectedProcedure>[0];
export type OrganizationProcedureArgs = Parameters<
  typeof organizationProcedure
>[0];
