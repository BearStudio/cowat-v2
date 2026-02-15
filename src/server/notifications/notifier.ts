import type { Logger } from 'pino';

import type { NotificationChannel, NotificationEvent } from './types';

export class Notifier {
  private channels: NotificationChannel[] = [];

  register(channel: NotificationChannel): this {
    this.channels.push(channel);
    return this;
  }

  notify(event: NotificationEvent, logger: Logger): void {
    for (const channel of this.channels) {
      if (!channel.canSend(event)) continue;

      channel.send(event, logger).catch((error) => {
        logger.error(
          { error, channel: channel.name, eventType: event.type },
          'Notification channel failed'
        );
      });
    }
  }
}
