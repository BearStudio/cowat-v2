/** @jsxImportSource jsx-slack */
import { Blocks, Button } from 'jsx-slack';

import i18n from '@/lib/i18n';
import { routeUrl } from '@/lib/route-url';

import { SlackBody } from '@/features/slack/components/body';
import { SlackHeader } from '@/features/slack/components/header';
import type { BookingCanceledEvent } from '@/server/notifications/types';

import { formatDate, localizeTripType } from '../utils';

type Props = {
  event: BookingCanceledEvent;
  baseUrl: string;
};

export function BookingCanceled({ event, baseUrl }: Props) {
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
        {i18n.t('notifications:booking.canceled.headline')}
      </SlackHeader>
      <SlackBody>
        {i18n.t('notifications:booking.canceled.body', {
          passengerName: event.payload.passengerName,
        })}
        <br />
        <br />
        {i18n.t('notifications:booking.requestedContext.tripType', {
          tripType: localizeTripType(event.payload.tripType),
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
