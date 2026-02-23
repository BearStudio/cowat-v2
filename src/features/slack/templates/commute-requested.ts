import type { LanguageKey } from '@/lib/i18n/constants';

import type { CommuteRequestedEvent } from '@/server/notifications/types';

import { formatDate, type SlackBlock, t } from './utils';

export function commuteRequested(
  event: CommuteRequestedEvent,
  locale: LanguageKey,
  baseUrl: string,
  requesterSlackId?: string
): SlackBlock[] {
  const requester = requesterSlackId
    ? `<@${requesterSlackId}>`
    : event.payload.requesterName;

  const dateParam =
    event.payload.commuteDate instanceof Date
      ? event.payload.commuteDate.toISOString()
      : String(event.payload.commuteDate);

  const link = `${baseUrl}/app/${event.payload.orgSlug}/commutes/new?date=${encodeURIComponent(dateParam)}`;

  const templateKey = event.payload.locationName
    ? 'commute.requestedWithLocation'
    : 'commute.requested';

  const text = t(locale, templateKey, {
    requester,
    date: formatDate(event.payload.commuteDate, locale),
    locationName: event.payload.locationName ?? '',
  });

  return [
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `<!here> ${text}` },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: t(locale, 'commute.offerRide'),
          emoji: true,
        },
        url: link,
      },
    },
  ];
}
