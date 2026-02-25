/** @jsxImportSource jsx-slack */
import { Blocks, Button, Divider, Image, Mrkdwn, Section } from 'jsx-slack';

import i18n from '@/lib/i18n';

import { SlackBody } from '@/features/slack/components/body';
import { SlackFooter } from '@/features/slack/components/footer';
import { SlackHeader } from '@/features/slack/components/header';
import type {
  CommuteCreatedEvent,
  CommuteCreatedStop,
} from '@/server/notifications/types';

import { formatDate, localizeCommuteType } from '../utils';

type Props = {
  event: CommuteCreatedEvent;
  baseUrl: string;
  driverSlackId?: string;
  driverAvatarUrl?: string;
};

function stopBookingUrl(
  baseUrl: string,
  orgSlug: string,
  commuteId: string,
  stopId: string
): string {
  const params = new URLSearchParams({
    openCommutes: commuteId,
    bookingStop: stopId,
  });
  return `${baseUrl}/app/${orgSlug}/?${params.toString()}`;
}

function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function stopLabel(stop: CommuteCreatedStop): string {
  const times = stop.inwardTime
    ? `⬆ ${stop.outwardTime}   ⬇ ${stop.inwardTime}`
    : `⬆ ${stop.outwardTime}`;
  const addressLine = stop.locationAddress
    ? `\n<${mapsUrl(stop.locationAddress)}|${stop.locationAddress}>`
    : '';
  return `📍 *${stop.locationName}*   ${times}${addressLine}`;
}

export function CommuteCreated({
  event,
  baseUrl,
  driverSlackId,
  driverAvatarUrl,
}: Props) {
  const { payload } = event;
  const driver = driverSlackId ? `<@${driverSlackId}>` : payload.driverName;

  const headerText = [
    `*${driver}* — *${localizeCommuteType(payload.commuteType)}*`,
    formatDate(payload.commuteDate),
  ].join('\n');

  const seatsKey =
    payload.seats === 1
      ? 'notifications:commute.createdContext'
      : 'notifications:commute.createdContextPlural';

  return (
    <Blocks>
      <SlackHeader>
        {`<!here> ${i18n.t('notifications:commute.createdAnnouncement')}`}
      </SlackHeader>
      <Divider />
      <SlackBody
        aside={
          driverAvatarUrl ? (
            <Image src={driverAvatarUrl} alt={payload.driverName} />
          ) : null
        }
      >
        {headerText}
      </SlackBody>
      {payload.stops.map((stop) => (
        // eslint-disable-next-line @eslint-react/no-missing-key
        <Section>
          <Mrkdwn>{stopLabel(stop)}</Mrkdwn>
          <Button
            url={stopBookingUrl(
              baseUrl,
              payload.orgSlug,
              payload.commuteId,
              stop.stopId
            )}
          >
            {i18n.t('notifications:commute.bookStop')}
          </Button>
        </Section>
      ))}
      <SlackFooter>
        {i18n.t(seatsKey, { seats: String(payload.seats) })}
      </SlackFooter>
    </Blocks>
  );
}
