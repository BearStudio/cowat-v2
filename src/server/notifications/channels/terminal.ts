import type { NotificationChannel } from '../types';

export const terminalChannel: NotificationChannel = {
  name: 'terminal',

  canSend() {
    return true;
  },

  async send(event, logger) {
    logger.info(
      {
        eventType: event.type,
        recipient: event.recipient.name,
        payload: event.payload,
      },
      `[NOTIFY] ${event.type} → ${event.recipient.name} (${event.recipient.email})`
    );
  },
};
