import { Result } from 'better-result';

import type { LanguageKey } from '@/lib/i18n/constants';
import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

import { envServer } from '@/env/server';
import { getSlackTemplate } from '@/features/slack/templates';
import { getSlackApp } from '@/server/slack';

import type { NotificationChannel } from '../types';

type SlackChannelConfig = {
  locale?: LanguageKey;
};

export function createSlackChannel(
  config?: SlackChannelConfig
): NotificationChannel {
  const locale = config?.locale ?? DEFAULT_LANGUAGE_KEY;

  return {
    name: 'slack',

    canSend() {
      return getSlackApp() !== null;
    },

    async send(event, logger) {
      const app = getSlackApp();
      if (!app) return;

      // commute.created is a broadcast — always goes to the default channel
      if (event.type === 'commute.created') {
        const defaultChannel = envServer.SLACK_DEFAULT_CHANNEL;
        if (!defaultChannel) {
          logger.warn(
            { eventType: event.type },
            'Slack: no default channel configured, skipping broadcast'
          );
          return;
        }

        // Resolve the driver's Slack ID so we can @mention them
        const driverLookup = await Result.tryPromise(() =>
          app.client.users.lookupByEmail({
            email: event.payload.driverEmail,
          })
        );

        const driverSlackId = driverLookup.isOk()
          ? driverLookup.value.user?.id
          : undefined;

        if (driverLookup.isErr()) {
          logger.warn(
            { email: event.payload.driverEmail, error: driverLookup.error },
            'Slack: could not resolve driver for @mention, falling back to name'
          );
        }

        const text = getSlackTemplate(event, { driverSlackId });

        const postResult = await Result.tryPromise(() =>
          app.client.chat.postMessage({ channel: defaultChannel, text })
        );
        if (postResult.isErr()) {
          logger.error(
            { channel: defaultChannel, error: postResult.error },
            'Slack: failed to post broadcast message'
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

      const text = getSlackTemplate(event, { locale });

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
        app.client.chat.postMessage({ channel, text })
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
