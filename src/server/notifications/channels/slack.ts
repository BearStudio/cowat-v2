import { Result } from 'better-result';

import { envServer } from '@/env/server';
import { getSlackApp } from '@/server/slack';

import type { NotificationChannel, NotificationEvent } from '../types';

export const slackChannel: NotificationChannel = {
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

      const text = formatBroadcast(event, driverSlackId);

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

    const text = formatMessage(event);

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

function formatDate(commuteDate: NotificationEvent['payload']['commuteDate']) {
  return commuteDate instanceof Date
    ? commuteDate.toLocaleDateString()
    : String(commuteDate);
}

function formatBroadcast(
  event: Extract<NotificationEvent, { type: 'commute.created' }>,
  driverSlackId: string | undefined
): string {
  const date = formatDate(event.payload.commuteDate);
  const driver = driverSlackId
    ? `<@${driverSlackId}>`
    : `*${event.payload.driverName}*`;
  return `${driver} created a new ${event.payload.commuteType} commute on ${date}.`;
}

function formatMessage(event: NotificationEvent): string {
  const { commuteDate, commuteType } = event.payload;
  const date = formatDate(commuteDate);

  switch (event.type) {
    case 'booking.requested':
      return `New booking request from *${event.payload.passengerName}* for your ${commuteType} commute on ${date}.`;
    case 'booking.accepted':
      return `*${event.payload.driverName}* accepted your booking for the ${commuteType} commute on ${date}.`;
    case 'booking.refused':
      return `*${event.payload.driverName}* declined your booking for the ${commuteType} commute on ${date}.`;
    case 'booking.canceled':
      return `*${event.payload.passengerName}* canceled their booking on your ${commuteType} commute on ${date}.`;
    case 'commute.created':
      return `*${event.payload.driverName}* created a new ${commuteType} commute on ${date}.`;
    case 'commute.updated':
      return `*${event.payload.driverName}* updated the ${commuteType} commute on ${date}.`;
    case 'commute.canceled':
      return `*${event.payload.driverName}* canceled the ${commuteType} commute on ${date}.`;
  }
}
