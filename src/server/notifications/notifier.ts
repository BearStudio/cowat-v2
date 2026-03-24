import type { Logger } from 'pino';

import type {
  NotificationChannel,
  NotificationEvent,
  NotifyOrgContext,
} from './types';
import { filterEventForChannel } from './utils';

export class Notifier {
  private channels: NotificationChannel[] = [];

  register(channel: NotificationChannel): this {
    this.channels.push(channel);
    return this;
  }

  async notify(
    event: NotificationEvent,
    logger: Logger,
    orgContext?: NotifyOrgContext
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const channel of this.channels) {
      const channelEvent = filterEventForChannel(event, channel.name);

      if (!channelEvent) {
        logger.debug(
          { channel: channel.name, eventType: event.type },
          '[NOTIFY] no eligible recipients for channel, skipping'
        );
        continue;
      }

      const promise = Promise.resolve(channel.canSend(channelEvent, orgContext))
        .then((canSend) => {
          logger.debug(
            { channel: channel.name, eventType: event.type, canSend },
            '[NOTIFY] canSend result'
          );
          if (!canSend) return;
          return channel.send(channelEvent, logger, orgContext);
        })
        .then(() => undefined)
        .catch((error) => {
          logger.error(
            { err: error, channel: channel.name, eventType: event.type },
            'Notification channel failed'
          );
        });

      promises.push(promise);
    }

    await Promise.allSettled(promises);
  }
}
