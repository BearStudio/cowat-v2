/** @jsxImportSource jsx-slack */
import { Blocks, Button, Divider, Image, Mrkdwn, Section } from 'jsx-slack';

import type { LanguageKey } from '@/lib/i18n/constants';

import type { CommuteCreatedEvent } from '@/server/notifications/types';

import { formatDate, localizeCommuteType, t } from './utils';

type Props = {
  event: CommuteCreatedEvent;
  locale: LanguageKey;
  baseUrl: string;
  driverSlackId?: string;
  driverAvatarUrl?: string;
};

export function CommuteCreated({
  event,
  locale,
  baseUrl,
  driverSlackId,
  driverAvatarUrl,
}: Props) {
  const driver = driverSlackId
    ? `<@${driverSlackId}>`
    : event.payload.driverName;

  const commutesUrl = `${baseUrl}/app/${event.payload.orgSlug}/commutes`;

  const headerText = [
    `*${driver}* — *${localizeCommuteType(locale, event.payload.commuteType)}*`,
    formatDate(event.payload.commuteDate, locale),
    t(locale, 'commute.createdContext', { seats: String(event.payload.seats) }),
  ].join('\n');

  const inwardStops = event.payload.stops.filter((stop) => stop.inwardTime);

  return (
    <Blocks>
      <Section>
        <Mrkdwn>{`<!here> ${t(locale, 'commute.createdAnnouncement')}`}</Mrkdwn>
        <Button url={commutesUrl}>{t(locale, 'commute.seeAllCommutes')}</Button>
      </Section>
      <Divider />
      <Section>
        <Mrkdwn>{headerText}</Mrkdwn>
        {driverAvatarUrl && (
          <Image src={driverAvatarUrl} alt={event.payload.driverName} />
        )}
      </Section>
      <Section>
        <Mrkdwn>*⏰ Outward*</Mrkdwn>
      </Section>
      {event.payload.stops.map((stop) => (
        // eslint-disable-next-line @eslint-react/no-missing-key
        <Section>
          <Mrkdwn>{`📍 *${stop.locationName}*   ⏰ ${stop.outwardTime}`}</Mrkdwn>
        </Section>
      ))}
      {inwardStops.length > 0 && (
        <>
          <Divider />
          <Section>
            <Mrkdwn>*↩ Inward*</Mrkdwn>
          </Section>
          {inwardStops.map((stop) => (
            // eslint-disable-next-line @eslint-react/no-missing-key
            <Section>
              <Mrkdwn>{`📍 *${stop.locationName}*   ↩ ${stop.inwardTime}`}</Mrkdwn>
            </Section>
          ))}
        </>
      )}
    </Blocks>
  );
}
