import type { NotificationChannel } from '../types';

export const terminalChannel: NotificationChannel = {
  name: 'terminal',

  canSend() {
    return true;
  },

  async send(event, logger) {
    const recipient =
      'recipient' in event
        ? `${event.recipient.name} (${event.recipient.email})`
        : 'broadcast';

    logger.info(
      { eventType: event.type, recipient, payload: event.payload },
      `[NOTIFY] ${event.type} → ${recipient}`
    );
  },
};
