import { App } from '@slack/bolt';
import { Result } from 'better-result';

import type { LanguageKey } from '@/lib/i18n/constants';
import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

import { envClient } from '@/env/client';
import { getFallbackText, getSlackBlocks } from '@/features/slack/templates';
import { decrypt } from '@/server/encryption';

import type { NotificationChannel, NotifyOrgContext } from '../types';

async function resolveSlackConfig(orgContext?: NotifyOrgContext): Promise<{
  app: App | null;
  defaultChannel: string | undefined;
  locale: LanguageKey;
}> {
  const disabled = {
    app: null,
    defaultChannel: undefined,
    locale: DEFAULT_LANGUAGE_KEY,
  } as const;

  if (!orgContext) return disabled;

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

    canSend() {
      // Always allow — canSend doesn't have DB access; actual availability is
      // checked in send() using org-level config or global env vars.
      return true;
    },

    async send(event, logger, orgContext?: NotifyOrgContext) {
      const { app, defaultChannel, locale } =
        await resolveSlackConfig(orgContext);

      if (!app) return;

      // commute.created — broadcast to default channel with driver @mention and avatar
      if (event.type === 'commute.created') {
        if (!defaultChannel) {
          logger.warn(
            { eventType: event.type },
            'Slack: no default channel configured, skipping broadcast'
          );
          return;
        }

        const userLookup = await Result.tryPromise(() =>
          app.client.users.lookupByEmail({ email: event.payload.driverEmail })
        );

        const slackUser = userLookup.isOk() ? userLookup.value.user : undefined;

        if (userLookup.isErr()) {
          logger.warn(
            { email: event.payload.driverEmail, error: userLookup.error },
            'Slack: could not resolve driver for @mention, falling back to name'
          );
        }

        const blocks = getSlackBlocks(event, {
          driverSlackId: slackUser?.id,
          driverAvatarUrl: slackUser?.profile?.image_72 ?? undefined,
          locale,
        });

        const postResult = await Result.tryPromise(() =>
          app.client.chat.postMessage({
            channel: defaultChannel,
            blocks,
            text: getFallbackText(blocks),
          })
        );
        if (postResult.isErr()) {
          logger.error(
            { channel: defaultChannel, error: postResult.error },
            'Slack: failed to post commute.created broadcast'
          );
        }
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

        const userLookup = await Result.tryPromise(() =>
          app.client.users.lookupByEmail({
            email: event.payload.requesterEmail,
          })
        );

        const slackUser = userLookup.isOk() ? userLookup.value.user : undefined;

        if (userLookup.isErr()) {
          logger.warn(
            { email: event.payload.requesterEmail, error: userLookup.error },
            'Slack: could not resolve requester for @mention, falling back to name'
          );
        }

        const blocks = getSlackBlocks(event, {
          requesterSlackId: slackUser?.id,
          baseUrl: envClient.VITE_BASE_URL,
          locale,
        });

        const postResult = await Result.tryPromise(() =>
          app.client.chat.postMessage({
            channel: defaultChannel,
            blocks,
            text: getFallbackText(blocks),
          })
        );
        if (postResult.isErr()) {
          logger.error(
            { channel: defaultChannel, error: postResult.error },
            'Slack: failed to post commute.requested broadcast'
          );
        }
        return;
      }

      // Skip DM if recipient opted out of Slack notifications
      if (event.recipient.disabledChannels?.includes('slack')) {
        logger.info(
          { userId: event.recipient.userId, eventType: event.type },
          'Slack: recipient opted out of Slack DMs, skipping'
        );
        return;
      }

      const blocks = getSlackBlocks(event, { locale });

      // All other events → DM the recipient
      const lookupResult = await Result.tryPromise(() =>
        app.client.users.lookupByEmail({ email: event.recipient.email })
      );

      if (lookupResult.isErr()) {
        logger.warn(
          { email: event.recipient.email, error: lookupResult.error },
          'Slack: no Slack user found for email, skipping DM'
        );
        return;
      }

      const channel = lookupResult.value.user?.id;
      if (!channel) {
        logger.warn(
          { email: event.recipient.email },
          'Slack: lookupByEmail returned no user ID, skipping DM'
        );
        return;
      }

      const postResult = await Result.tryPromise(() =>
        app.client.chat.postMessage({
          channel,
          blocks,
          text: getFallbackText(blocks),
        })
      );
      if (postResult.isErr()) {
        logger.error(
          { channel, eventType: event.type, error: postResult.error },
          'Slack: failed to send DM'
        );
      }
    },
  };
}
