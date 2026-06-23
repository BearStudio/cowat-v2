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

// The bot token is a secret: it is WRITE-ONLY across the API surface. The
// output never returns it (only whether one is set); the input accepts it but
// treats a blank value as "keep the stored token".
const zOrgSlackConfigOutput = z.object({
  enabled: z.boolean(),
  hasToken: z.boolean(),
  broadcastChannel: z.string().nullable(),
  locale: z.enum(['en', 'fr']).nullable(),
});

const zOrgSlackConfigInput = z.object({
  enabled: z.boolean(),
  // Nullish / empty ⇒ preserve the existing token (do not overwrite it).
  token: z.string().nullish(),
  broadcastChannel: z.string().nullable(),
  locale: z.enum(['en', 'fr']).nullable(),
});

export default {
  getSlack: procedure({ permissions: { orgNotificationChannel: ['manage'] } })
    .route({
      method: 'GET',
      path: '/organizations/notification-channel/slack',
      tags,
    })
    .output(zOrgSlackConfigOutput.nullable())
    .handler(async ({ context }) => {
      const channel = await context.orgChannels.findByOrgAndType(
        context.organizationId,
        'SLACK'
      );

      if (!channel) return null;

      return {
        enabled: channel.enabled,
        hasToken: channel.token !== null,
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
    .input(zOrgSlackConfigInput)
    .output(z.void())
    .handler(async ({ context, input }) => {
      // Preserve the stored token when the client sends a blank value (the UI
      // never receives the secret back, so it cannot resubmit it).
      let token = input.token || null;
      if (!token) {
        const existing = await context.orgChannels.findByOrgAndType(
          context.organizationId,
          'SLACK'
        );
        token = existing?.token ?? null;
      }

      await context.orgChannels.upsert({
        orgId: context.organizationId,
        type: 'SLACK',
        enabled: input.enabled,
        token,
        broadcastChannel: input.broadcastChannel,
        locale: input.locale,
      });
    }),
};
