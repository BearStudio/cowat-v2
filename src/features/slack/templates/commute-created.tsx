/** @jsxImportSource jsx-slack */
import { Blocks, Context, Divider, Image, Mrkdwn, Section } from 'jsx-slack';

import type { LanguageKey } from '@/lib/i18n/constants';

import type { CommuteCreatedEvent } from '@/server/notifications/types';

import { formatDate, localizeCommuteType, t } from './utils';

type Props = {
  event: CommuteCreatedEvent;
  locale: LanguageKey;
  driverSlackId?: string;
  driverAvatarUrl?: string;
};

export function CommuteCreated({
  event,
  locale,
  driverSlackId,
  driverAvatarUrl,
}: Props) {
  const driver = driverSlackId
    ? `<@${driverSlackId}>`
    : event.payload.driverName;

  const stopsText = event.payload.stops
    .map((stop) =>
      stop.inwardTime
        ? `📍 *${stop.locationName}*   ⏰ ${stop.outwardTime} · ↩ ${stop.inwardTime}`
        : `📍 *${stop.locationName}*   ⏰ ${stop.outwardTime}`
    )
    .join('\n');

  const detailText = [
    `*${driver}* — *${localizeCommuteType(locale, event.payload.commuteType)}*`,
    formatDate(event.payload.commuteDate, locale),
    '',
    stopsText,
  ].join('\n');

  return (
    <Blocks>
      <Section>
        <Mrkdwn>{`<!here> ${t(locale, 'commute.createdAnnouncement')}`}</Mrkdwn>
      </Section>
      <Divider />
      <Section>
        <Mrkdwn>{detailText}</Mrkdwn>
        {driverAvatarUrl && (
          <Image src={driverAvatarUrl} alt={event.payload.driverName} />
        )}
      </Section>
      <Context>
        <Mrkdwn>
          {t(locale, 'commute.createdContext', {
            seats: String(event.payload.seats),
          })}
        </Mrkdwn>
      </Context>
    </Blocks>
  );
}
