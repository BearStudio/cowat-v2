import { App } from '@slack/bolt';
import { Result } from 'better-result';
import JSXSlack from 'jsx-slack';

import type { LanguageKey } from '@/lib/i18n/constants';
import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

import { envClient } from '@/env/client';
import {
  getBroadcastBlocks,
  getFallbackText,
  getPrivateBlocks,
} from '@/features/slack/templates';
import { decrypt } from '@/server/encryption';

import type { NotificationChannel, NotifyOrgContext } from '../types';

async function resolveSlackConfig(orgContext: NotifyOrgContext): Promise<{
  app: App | null;
  defaultChannel: string | undefined;
  locale: LanguageKey;
}> {
  const disabled = {
    app: null,
    defaultChannel: undefined,
    locale: DEFAULT_LANGUAGE_KEY,
  } as const;

  const orgChannel = await orgContext.db.orgNotificationChannel.findUnique({
    where: { orgId_type: { orgId: orgContext.organizationId, type: 'SLACK' } },
  });

  if (!orgChannel) return disabled;
  if (!orgChannel.enabled) return disabled;

  const token = orgChannel.token ? decrypt(orgChannel.token) : null;
  if (!token) return disabled;

  return {
    app: new App({ token, signingSecret: '' }),
    defaultChannel: orgChannel.broadcastChannel
      ? decrypt(orgChannel.broadcastChannel)
      : undefined,
    locale: (orgChannel.locale as LanguageKey | null) ?? DEFAULT_LANGUAGE_KEY,
  };
}

export function createSlackChannel(): NotificationChannel {
  return {
    name: 'slack',

    async canSend(_event, orgContext) {
      if (!orgContext) return false;
      const { app } = await resolveSlackConfig(orgContext);
      return app !== null;
    },

    async send(event, logger, orgContext) {
      if (!orgContext) return;
      const { app, defaultChannel, locale } =
        await resolveSlackConfig(orgContext);

      if (!app) return;

      async function lookupUser(email: string) {
        const result = await Result.tryPromise(() =>
          app!.client.users.lookupByEmail({ email })
        );
        if (result.isErr()) {
          logger.warn(
            { email, error: result.error },
            'Slack: could not resolve user, falling back to name'
          );
        }
        return result.isOk() ? result.value.user : undefined;
      }

      async function post(
        channel: string,
        blocks: ReturnType<typeof JSXSlack>
      ) {
        const result = await Result.tryPromise(() =>
          app!.client.chat.postMessage({
            channel,
            blocks,
            text: getFallbackText(blocks),
          })
        );
        if (result.isErr()) {
          logger.error(
            { channel, eventType: event.type, error: result.error },
            'Slack: failed to post message'
          );
        }
      }

      // commute.created — broadcast to default channel with driver @mention and avatar
      if (event.type === 'commute.created') {
        if (!defaultChannel) {
          logger.warn(
            { eventType: event.type },
            'Slack: no default channel configured, skipping broadcast'
          );
          return;
        }
        const slackUser = await lookupUser(event.payload.driverEmail);
        await post(
          defaultChannel,
          JSXSlack(
            getBroadcastBlocks(event, {
              driverSlackId: slackUser?.id,
              driverAvatarUrl: slackUser?.profile?.image_72 ?? undefined,
              locale,
            })
          )
        );
        return;
      }

      // commute.requested — broadcast to default channel with requester @mention
      if (event.type === 'commute.requested') {
        if (!defaultChannel) {
          logger.warn(
            { eventType: event.type },
            'Slack: no default channel configured, skipping broadcast'
          );
          return;
        }
        const slackUser = await lookupUser(event.payload.requesterEmail);
        await post(
          defaultChannel,
          JSXSlack(
            getBroadcastBlocks(event, {
              requesterSlackId: slackUser?.id,
              baseUrl: envClient.VITE_BASE_URL,
              locale,
            })
          )
        );
        return;
      }

      // All other events → DM the recipient
      const slackUser = await lookupUser(event.recipient.email);
      if (!slackUser?.id) {
        logger.warn(
          { email: event.recipient.email },
          'Slack: no Slack user found for email, skipping DM'
        );
        return;
      }
      await post(
        slackUser.id,
        JSXSlack(
          getPrivateBlocks(event, { locale, baseUrl: envClient.VITE_BASE_URL })
        )
      );
    },
  };
}
