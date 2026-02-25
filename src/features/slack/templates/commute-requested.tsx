/** @jsxImportSource jsx-slack */
import { Blocks, Button } from 'jsx-slack';

import i18n from '@/lib/i18n';

import { SlackBody } from '@/features/slack/components/body';
import { SlackFooter } from '@/features/slack/components/footer';
import { SlackHeader } from '@/features/slack/components/header';
import type { CommuteRequestedEvent } from '@/server/notifications/types';

import { formatDate } from '../utils';

type Props = {
  event: CommuteRequestedEvent;
  baseUrl: string;
  requesterSlackId?: string;
};

export function CommuteRequested({ event, baseUrl, requesterSlackId }: Props) {
  const requester = requesterSlackId
    ? `<@${requesterSlackId}>`
    : event.payload.requesterName;

  const dateParam =
    event.payload.commuteDate instanceof Date
      ? event.payload.commuteDate.toISOString()
      : String(event.payload.commuteDate);

  const link = `${baseUrl}/app/${event.payload.orgSlug}/commutes/new?date=${encodeURIComponent(dateParam)}`;

  const { locationName } = event.payload;
  const formattedDate = formatDate(event.payload.commuteDate);

  const headline = `<!here> ${i18n.t('notifications:commute.requested.headline')}`;
  const body = locationName
    ? i18n.t('notifications:commute.requestedWithLocation.body', {
        requester,
        date: formattedDate,
        locationName,
      })
    : i18n.t('notifications:commute.requested.body', {
        requester,
        date: formattedDate,
      });

  const contextText = locationName
    ? i18n.t('notifications:commute.requestedContextWithLocation', {
        date: formattedDate,
        locationName,
      })
    : i18n.t('notifications:commute.requestedContext', { date: formattedDate });

  return (
    <Blocks>
      <SlackHeader
        aside={
          <Button url={link}>
            {i18n.t('notifications:commute.offerRide')}
          </Button>
        }
      >
        {headline}
      </SlackHeader>
      <SlackBody>{body}</SlackBody>
      <SlackFooter>{contextText}</SlackFooter>
    </Blocks>
  );
}
