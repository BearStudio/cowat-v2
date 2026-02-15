import { z } from 'zod';

import { zFormFieldsOnboarding } from '@/features/auth/schema';
import { zNotificationChannel } from '@/features/notification/schema';
import { zUser } from '@/features/user/schema';
import { protectedProcedure } from '@/server/orpc';

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
        autoAccept: true,
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
          autoAccept: input.autoAccept,
        },
      });
    }),

  getNotificationPreferences: protectedProcedure({
    permission: null,
  })
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
        where: { userId: context.user.id },
        select: { channel: true, enabled: true },
      });
    }),

  updateNotificationPreference: protectedProcedure({
    permission: null,
  })
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
          userId_channel: {
            userId: context.user.id,
            channel: input.channel,
          },
        },
        update: { enabled: input.enabled },
        create: {
          userId: context.user.id,
          channel: input.channel,
          enabled: input.enabled,
        },
      });
    }),
};
