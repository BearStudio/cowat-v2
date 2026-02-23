/** @jsxImportSource jsx-slack */
import { Blocks, Button, Mrkdwn, Section } from 'jsx-slack';

import type { LanguageKey } from '@/lib/i18n/constants';

import type { CommuteRequestedEvent } from '@/server/notifications/types';

import { formatDate, t } from './utils';

type Props = {
  event: CommuteRequestedEvent;
  locale: LanguageKey;
  baseUrl: string;
  requesterSlackId?: string;
};

export function CommuteRequested({
  event,
  locale,
  baseUrl,
  requesterSlackId,
}: Props) {
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

  return (
    <Blocks>
      <Section>
        <Mrkdwn>{text}</Mrkdwn>
        <Button url={link}>{t(locale, 'commute.offerRide')}</Button>
      </Section>
    </Blocks>
  );
}
