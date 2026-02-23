import { z } from 'zod';

import {
  organizationProcedure,
  type OrganizationProcedureArgs,
} from '@/server/orpc';
import { createOrgNotificationChannelRepository } from '@/server/repositories/org-notification-channel.repository';

const tags = ['org-notification-channel'];

const procedure = (args: OrganizationProcedureArgs = {}) =>
  organizationProcedure(args).use(({ context, next }) =>
    next({
      context: {
        orgChannels: createOrgNotificationChannelRepository(context.db),
      },
    })
  );

const zOrgSlackConfig = z.object({
  enabled: z.boolean(),
  token: z.string().nullable(),
  broadcastChannel: z.string().nullable(),
  locale: z.enum(['en', 'fr']).nullable(),
});

export default {
  getSlack: procedure()
    .route({
      method: 'GET',
      path: '/organizations/notification-channel/slack',
      tags,
    })
    .output(zOrgSlackConfig.nullable())
    .handler(async ({ context }) => {
      const channel = await context.orgChannels.findByOrgAndType(
        context.organizationId,
        'SLACK'
      );

      if (!channel) return null;

      return {
        enabled: channel.enabled,
        token: channel.token,
        broadcastChannel: channel.broadcastChannel,
        locale: (channel.locale as 'en' | 'fr' | null) ?? null,
      };
    }),

  updateSlack: procedure({
    permissions: { orgNotificationChannel: ['manage'] },
  })
    .route({
      method: 'POST',
      path: '/organizations/notification-channel/slack',
      tags,
    })
    .input(zOrgSlackConfig)
    .output(z.void())
    .handler(async ({ context, input }) => {
      await context.orgChannels.upsert({
        orgId: context.organizationId,
        type: 'SLACK',
        enabled: input.enabled,
        token: input.token,
        broadcastChannel: input.broadcastChannel,
        locale: input.locale,
      });
    }),
};
