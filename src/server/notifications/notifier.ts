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
      // notificationPreferences contains ONLY disabled channels (queried with
      // `where: { enabled: false }`), so any match means this channel is off.
      const isDisabledForRecipient =
        recipient?.notificationPreferences?.some(
          (p) => p.channel.toLowerCase() === channel.name
        ) ?? false;

      if (isDisabledForRecipient) continue;

      Promise.resolve(channel.canSend(event, orgContext))
        .then((canSend) => {
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
