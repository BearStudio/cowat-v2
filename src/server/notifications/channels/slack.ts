import { Result } from 'better-result';

import type { LanguageKey } from '@/lib/i18n/constants';
import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

import { envClient } from '@/env/client';
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

      // Broadcast events — always go to the default channel
      if (
        event.type === 'commute.created' ||
        event.type === 'commute.requested'
      ) {
        const defaultChannel = envServer.SLACK_DEFAULT_CHANNEL;
        if (!defaultChannel) {
          logger.warn(
            { eventType: event.type },
            'Slack: no default channel configured, skipping broadcast'
          );
          return;
        }

        const emailToResolve =
          event.type === 'commute.created'
            ? event.payload.driverEmail
            : event.payload.requesterEmail;

        const userLookup = await Result.tryPromise(() =>
          app.client.users.lookupByEmail({ email: emailToResolve })
        );

        const slackId = userLookup.isOk()
          ? userLookup.value.user?.id
          : undefined;

        if (userLookup.isErr()) {
          logger.warn(
            { email: emailToResolve, error: userLookup.error },
            'Slack: could not resolve user for @mention, falling back to name'
          );
        }

        const text = getSlackTemplate(event, {
          driverSlackId: event.type === 'commute.created' ? slackId : undefined,
          requesterSlackId:
            event.type === 'commute.requested' ? slackId : undefined,
          baseUrl: envClient.VITE_BASE_URL,
        });

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
