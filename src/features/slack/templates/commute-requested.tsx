/** @jsxImportSource jsx-slack */
import { Blocks, Button } from 'jsx-slack';

import i18n from '@/lib/i18n';
import { routeUrl } from '@/lib/route-url';

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
  const dateParam =
    event.payload.commuteDate instanceof Date
      ? event.payload.commuteDate.toISOString()
      : String(event.payload.commuteDate);

  const link = routeUrl(baseUrl, '/app/$orgSlug/commutes/new', {
    params: { orgSlug: event.payload.orgSlug },
    search: { date: dateParam },
  });

  const { locationName } = event.payload;
  const formattedDate = formatDate(event.payload.commuteDate);

  const bodySuffix = locationName
    ? i18n.t('notifications:commute.requestedWithLocation.body', {
        date: formattedDate,
        locationName,
      })
    : i18n.t('notifications:commute.requested.body', { date: formattedDate });

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
        <>
          <a href="@here" />{' '}
          {i18n.t('notifications:commute.requested.headline')}
        </>
      </SlackHeader>
      <SlackBody>
        <>
          {requesterSlackId ? (
            <a href={`@${requesterSlackId}`} />
          ) : (
            event.payload.requesterName
          )}{' '}
          {bodySuffix}
        </>
      </SlackBody>
      <SlackFooter>{contextText}</SlackFooter>
    </Blocks>
  );
}
