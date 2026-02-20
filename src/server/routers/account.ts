import { z } from 'zod';

import { zFormFieldsOnboarding } from '@/features/auth/schema';
import { zNotificationChannel } from '@/features/notification/schema';
import { zUser } from '@/features/user/schema';
import { organizationProcedure, protectedProcedure } from '@/server/orpc';
import { createAccountRepository } from '@/server/repositories/account.repository';

const tags = ['account'];

const authProcedure = (args: Parameters<typeof protectedProcedure>[0]) =>
  protectedProcedure(args).use(({ context, next }) =>
    next({ context: { account: createAccountRepository(context.db) } })
  );

const orgProcedure = (args: Parameters<typeof organizationProcedure>[0] = {}) =>
  organizationProcedure(args).use(({ context, next }) =>
    next({ context: { account: createAccountRepository(context.db) } })
  );

export default {
  submitOnboarding: authProcedure({ permission: null })
    .route({ method: 'POST', path: '/account/submit-onboarding', tags })
    .input(zFormFieldsOnboarding())
    .output(z.void())
    .handler(async ({ context, input }) => {
      context.logger.info('Update user');
      await context.account.updateUser(context.user.id, {
        ...input,
        onboardedAt: new Date(),
      });
    }),

  updateInfo: authProcedure({ permission: null })
    .route({ method: 'POST', path: '/account/info', tags })
    .input(zUser().pick({ name: true, phone: true }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      context.logger.info('Update user');
      await context.account.updateUser(context.user.id, {
        name: input.name ?? '',
        phone: input.phone ?? null,
      });
    }),

  getAutoAccept: orgProcedure()
    .route({ method: 'GET', path: '/account/auto-accept', tags })
    .input(z.void())
    .output(z.object({ autoAccept: z.boolean() }))
    .handler(async ({ context }) => {
      return context.account.getMemberAutoAccept(context.memberId);
    }),

  updateAutoAccept: orgProcedure()
    .route({ method: 'POST', path: '/account/auto-accept', tags })
    .input(z.object({ autoAccept: z.boolean() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      await context.account.updateMemberAutoAccept(
        context.memberId,
        input.autoAccept
      );
    }),

  getNotificationPreferences: orgProcedure()
    .route({ method: 'GET', path: '/account/notification-preferences', tags })
    .input(z.void())
    .output(
      z.array(
        z.object({ channel: zNotificationChannel(), enabled: z.boolean() })
      )
    )
    .handler(async ({ context }) => {
      return context.account.getNotificationPreferences(context.memberId);
    }),

  updateNotificationPreference: orgProcedure()
    .route({ method: 'POST', path: '/account/notification-preferences', tags })
    .input(z.object({ channel: zNotificationChannel(), enabled: z.boolean() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      await context.account.upsertNotificationPreference({
        memberId: context.memberId,
        channel: input.channel,
        enabled: input.enabled,
      });
    }),
};
