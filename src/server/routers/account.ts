import { z } from 'zod';

import { zFormFieldsOnboarding } from '@/features/auth/schema';
import { zNotificationChannel } from '@/features/notification/schema';
import { zUser } from '@/features/user/schema';
import { organizationProcedure, protectedProcedure } from '@/server/orpc';

const tags = ['account'];

export default {
  submitOnboarding: protectedProcedure({
    permission: null,
  })
    .route({
      method: 'POST',
      path: '/account/submit-onboarding',
      tags,
    })
    .input(zFormFieldsOnboarding())
    .output(z.void())
    .handler(async ({ context, input }) => {
      context.logger.info('Update user');
      await context.db.user.update({
        where: { id: context.user.id },
        data: {
          ...input,
          onboardedAt: new Date(),
        },
      });
    }),

  updateInfo: protectedProcedure({
    permission: null,
  })
    .route({
      method: 'POST',
      path: '/account/info',
      tags,
    })
    .input(
      zUser().pick({
        name: true,
        phone: true,
      })
    )
    .output(z.void())
    .handler(async ({ context, input }) => {
      context.logger.info('Update user');
      await context.db.user.update({
        where: { id: context.user.id },
        data: {
          name: input.name ?? '',
          phone: input.phone ?? null,
        },
      });
    }),

  getAutoAccept: organizationProcedure({ permission: null })
    .route({
      method: 'GET',
      path: '/account/auto-accept',
      tags,
    })
    .input(z.void())
    .output(z.object({ autoAccept: z.boolean() }))
    .handler(async ({ context }) => {
      const member = await context.db.member.findUniqueOrThrow({
        where: { id: context.memberId },
        select: { autoAccept: true },
      });
      return member;
    }),

  updateAutoAccept: organizationProcedure({ permission: null })
    .route({
      method: 'POST',
      path: '/account/auto-accept',
      tags,
    })
    .input(z.object({ autoAccept: z.boolean() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      await context.db.member.update({
        where: { id: context.memberId },
        data: { autoAccept: input.autoAccept },
      });
    }),

  getNotificationPreferences: organizationProcedure({ permission: null })
    .route({
      method: 'GET',
      path: '/account/notification-preferences',
      tags,
    })
    .input(z.void())
    .output(
      z.array(
        z.object({ channel: zNotificationChannel(), enabled: z.boolean() })
      )
    )
    .handler(async ({ context }) => {
      return await context.db.notificationPreference.findMany({
        where: { memberId: context.memberId },
        select: { channel: true, enabled: true },
      });
    }),

  updateNotificationPreference: organizationProcedure({ permission: null })
    .route({
      method: 'POST',
      path: '/account/notification-preferences',
      tags,
    })
    .input(z.object({ channel: zNotificationChannel(), enabled: z.boolean() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      await context.db.notificationPreference.upsert({
        where: {
          memberId_channel: {
            memberId: context.memberId,
            channel: input.channel,
          },
        },
        update: { enabled: input.enabled },
        create: {
          memberId: context.memberId,
          channel: input.channel,
          enabled: input.enabled,
        },
      });
    }),
};
