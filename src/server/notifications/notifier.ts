import type { Logger } from 'pino';

import type {
  NotificationChannel,
  NotificationEvent,
  NotifyOrgContext,
} from './types';

export class Notifier {
  private channels: NotificationChannel[] = [];

  register(channel: NotificationChannel): this {
    this.channels.push(channel);
    return this;
  }

  notify(
    event: NotificationEvent,
    logger: Logger,
    orgContext?: NotifyOrgContext
  ): void {
    const recipient = 'recipient' in event ? event.recipient : undefined;

    for (const channel of this.channels) {
      const isDisabledForRecipient =
        recipient?.notificationPreferences?.some(
          (p) => p.channel.toLowerCase() === channel.name
        ) ?? false;

      if (isDisabledForRecipient) {
        logger.debug(
          { channel: channel.name, eventType: event.type },
          '[NOTIFY] channel disabled for recipient, skipping'
        );
        continue;
      }

      Promise.resolve(channel.canSend(event, orgContext))
        .then((canSend) => {
          logger.debug(
            { channel: channel.name, eventType: event.type, canSend },
            '[NOTIFY] canSend result'
          );
          if (!canSend) return;
          return channel.send(event, logger, orgContext);
        })
        .catch((error) => {
          logger.error(
            { err: error, channel: channel.name, eventType: event.type },
            'Notification channel failed'
          );
        });
    }
  }
}
