import type { LanguageKey } from '@/lib/i18n/constants';

import type { CommuteCreatedEvent } from '@/server/notifications/types';

import { formatDate, localizeCommuteType, type SlackBlock, t } from './utils';

export function commuteCreated(
  event: CommuteCreatedEvent,
  locale: LanguageKey,
  driverSlackId?: string,
  driverAvatarUrl?: string
): SlackBlock[] {
  const driver = driverSlackId
    ? `<@${driverSlackId}>`
    : event.payload.driverName;

  const headerText = t(locale, 'commute.created', {
    driver,
    commuteType: localizeCommuteType(locale, event.payload.commuteType),
    date: formatDate(event.payload.commuteDate, locale),
    seats: String(event.payload.seats),
  });

  const headerBlock: SlackBlock = {
    type: 'section',
    text: { type: 'mrkdwn', text: `<!here> ${headerText}` },
    ...(driverAvatarUrl && {
      accessory: {
        type: 'image',
        image_url: driverAvatarUrl,
        alt_text: event.payload.driverName,
      },
    }),
  };

  const stopBlocks: SlackBlock[] = event.payload.stops.map((stop) => {
    const timeText = stop.inwardTime
      ? `⏰ ${stop.outwardTime} · ↩ ${stop.inwardTime}`
      : `⏰ ${stop.outwardTime}`;

    return {
      type: 'section',
      text: { type: 'mrkdwn', text: `📍 *${stop.locationName}*   ${timeText}` },
    };
  });

  return [headerBlock, { type: 'divider' }, ...stopBlocks];
}
