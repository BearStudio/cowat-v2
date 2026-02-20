import type {
  BuilderWithMiddlewares,
  MergedCurrentContext,
} from '@orpc/server';
import { ORPCError, os } from '@orpc/server';
import { type ResponseHeadersPluginContext } from '@orpc/server/plugins';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { match } from 'ts-pattern';

import {
  OrganizationPermission,
  Permission,
} from '@/features/auth/permissions';
import { auth } from '@/server/auth';
import { type AppDB, db } from '@/server/db';
import { Prisma } from '@/server/db/generated/client';
import { logger } from '@/server/logger';
import type { NotificationEvent } from '@/server/notifications';
import { notifier } from '@/server/notifications';
import { timingStore } from '@/server/timing-store';

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
        notify: (event: NotificationEvent) => {
          notifier.notify(event, context.logger);
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
        throw match(error.code)
          .with('P2002', () => {
            context.logger.warn(
              error.meta,
              `Prisma Error: ${error.code} ${error.message}`
            );
            return new ORPCError('CONFLICT', {
              message: 'Unique constraint violation',
              data: { target: error.meta?.target },
            });
          })
          .with('P2025', () => {
            context.logger.warn(
              error.meta,
              `Prisma Error ${error.code}: ${error.message}`
            );
            return new ORPCError('NOT_FOUND', {
              message: 'Record not found',
            });
          })
          .with('P2003', () => {
            context.logger.error(
              error.meta,
              `Prisma Error ${error.code}: ${error.message}`
            );
            return new ORPCError('BAD_REQUEST', {
              message: 'Foreign key constraint violation',
            });
          })
          .otherwise(() => {
            context.logger.error(
              error.meta,
              `Prisma Error ${error.code}: ${error.message}`
            );
            return new ORPCError('INTERNAL_SERVER_ERROR', {
              message: 'Database error',
            });
          });
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        context.logger.error(
          `Prisma Client Validation Error: ${error.message}`
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

// ORPC's `.use()` has the constraint `UOutContext extends IntersectPick<TCurrentContext, UOutContext>`.
// For repository objects, keys never overlap with the existing context, so IntersectPick resolves to {}
// and the constraint is always satisfied — but TypeScript can't verify this for a generic T at the
// definition site. We bypass the constraint with `as any` and annotate the correct return type explicitly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtendContext<TBuilder, TExtension extends Record<PropertyKey, any>> =
  TBuilder extends BuilderWithMiddlewares<
    infer I,
    infer C,
    infer IS,
    infer OS,
    infer EM,
    infer M
  >
    ? BuilderWithMiddlewares<
        I,
        MergedCurrentContext<C, TExtension>,
        IS,
        OS,
        EM,
        M
      >
    : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withRepositories<
  TProc extends (...args: any[]) => any,
  T extends Record<PropertyKey, any>,
>(baseProcedure: TProc, createRepositories: (db: AppDB) => T) {
  return (...args: Parameters<TProc>): ExtendContext<ReturnType<TProc>, T> =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (baseProcedure(...args) as any).use(({ context, next }: any) =>
      next({ context: createRepositories(context.db) })
    ) as ExtendContext<ReturnType<TProc>, T>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createOrgProcedure = <T extends Record<PropertyKey, any>>(
  createRepositories: (db: AppDB) => T
) => withRepositories(organizationProcedure, createRepositories);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createProtectedProcedure = <T extends Record<PropertyKey, any>>(
  createRepositories: (db: AppDB) => T
) => withRepositories(protectedProcedure, createRepositories);

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

    const userHasPermission = await auth.api.userHasPermission({
      body: {
        userId: user.id,
        permission,
      },
    });

    if (userHasPermission.error) {
      throw new ORPCError('INTERNAL_SERVER_ERROR');
    }

    if (!userHasPermission.success) {
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
  permissions,
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
    if (permissions) {
      const hasPermission = await auth.api.hasPermission({
        headers: getRequestHeaders(),
        body: {
          permission: permissions,
        },
      });

      if (!hasPermission.success) {
        throw new ORPCError('FORBIDDEN', {
          message: 'Insufficient organization permissions',
        });
      }
    }

    return await next({
      context: {
        organizationId,
        memberId: member.id,
      },
    });
  });
