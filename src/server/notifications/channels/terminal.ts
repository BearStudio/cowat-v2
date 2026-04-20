import type { NotificationChannel } from '../types';
import { getEventRecipients } from '../utils';

export const terminalChannel: NotificationChannel = {
  name: 'TERMINAL',

  canSend() {
    return true;
  },

  async send(event, logger) {
    const recipients = getEventRecipients(event);
    const [first] = recipients;
    const recipientLabel = first
      ? recipients.length > 1
        ? `${recipients.length} recipients`
        : `${first.name} (${first.email})`
      : 'broadcast';

    logger.info(
      {
        eventType: event.type,
        recipient: recipientLabel,
        payload: event.payload,
      },
      `[NOTIFY] ${event.type} → ${recipientLabel}`
    );
  },
};
