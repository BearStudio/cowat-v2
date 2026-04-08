/** @jsxImportSource jsx-slack */
import { Blocks, Button } from 'jsx-slack';

import i18n from '@/lib/i18n';
import { routeUrl } from '@/lib/route-url';

import { SlackBody } from '@/features/slack/components/body';
import { SlackHeader } from '@/features/slack/components/header';
import type { BookingRequestedEvent } from '@/server/notifications/types';

import { formatDate, getTripTypeIcon, localizeTripType } from '../utils';

type Props = {
  event: BookingRequestedEvent;
  baseUrl: string;
};

export function BookingRequested({ event, baseUrl }: Props) {
  const requestsUrl = routeUrl(baseUrl, '/app/$orgSlug/requests', {
    params: { orgSlug: event.payload.orgSlug },
  });

  return (
    <Blocks>
      <SlackHeader
        aside={
          <Button url={requestsUrl}>
            {i18n.t('notifications:booking.viewRequests')}
          </Button>
        }
      >
        {i18n.t('notifications:booking.requested.headline')}
      </SlackHeader>
      <SlackBody>
        {i18n.t('notifications:booking.requested.body', {
          passengerName: event.payload.passengerName,
        })}
        <br />
        <br />
        {getTripTypeIcon(event.payload.tripType)}{' '}
        {i18n.t('notifications:booking.requestedContext.tripType', {
          tripType: localizeTripType(event.payload.tripType).toUpperCase(),
        })}
        <br />
        <br />
        {i18n.t('notifications:booking.requestedContext.date', {
          date: formatDate(event.payload.commuteDate),
        })}
      </SlackBody>
    </Blocks>
  );
}
