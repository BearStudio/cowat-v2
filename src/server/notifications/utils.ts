import type { NotificationChannelType } from '@/server/db/generated/client';

import type {
  AllowedNotificationChannels,
  EventWithRecipient,
  NotificationEvent,
  Recipient,
} from './types';

/** Returns true if the given channel is enabled for the recipient (or no preferences exist → all enabled).
 *  Accepts channel names in any case (e.g. 'SLACK', 'slack', 'Push'). */
export function isChannelEnabledForRecipient(
  recipient: Pick<Recipient, 'notificationPreferences'>,
  channelName: AllowedNotificationChannels
): boolean {
  if (channelName === 'TERMINAL') return import.meta.env.DEV;

  const prefs = recipient.notificationPreferences;
  if (!prefs || prefs.length === 0) return true;

  const normalized = channelName.toUpperCase();
  return prefs.some((p) => p.channel === normalized);
}

/**
 * Filters an event's recipients for a given channel.
 * - Single-recipient events: returns null if the channel is disabled for the recipient.
 * - Multi-recipient events: returns a copy with only eligible recipients, or null if none.
 * - Broadcast events (no recipient): returns the event as-is.
 */
export function filterEventForChannel(
  event: NotificationEvent,
  channelName: AllowedNotificationChannels
): NotificationEvent | null {
  if ('recipient' in event) {
    return isChannelEnabledForRecipient(event.recipient, channelName)
      ? event
      : null;
  }

  if ('recipients' in event) {
    const filtered = event.recipients.filter((r) =>
      isChannelEnabledForRecipient(r, channelName)
    );
    return filtered.length > 0 ? { ...event, recipients: filtered } : null;
  }

  return event;
}

/** Map a member (with included user & notification prefs) to a Recipient. */
export function toRecipient(member: {
  notificationPreferences?: ReadonlyArray<{ channel: NotificationChannelType }>;
  user: { id: string; name: string; email: string };
}): Recipient {
  return {
    userId: member.user.id,
    name: member.user.name,
    email: member.user.email,
    notificationPreferences: member.notificationPreferences,
  };
}

/** Extracts recipients from any event shape (single, multi, or broadcast → empty). */
export function getEventRecipients(event: NotificationEvent): Recipient[] {
  if ('recipients' in event) return event.recipients;
  if ('recipient' in event) return [(event as EventWithRecipient).recipient];
  return [];
}
