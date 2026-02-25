/** @jsxImportSource jsx-slack */
import { Blocks, Button } from 'jsx-slack';

import i18n from '@/lib/i18n';

import { SlackBody } from '@/features/slack/components/body';
import { SlackFooter } from '@/features/slack/components/footer';
import { SlackHeader } from '@/features/slack/components/header';
import type { BookingRequestedEvent } from '@/server/notifications/types';

import { formatDate, localizeTripType } from '../utils';

type Props = {
  event: BookingRequestedEvent;
  baseUrl: string;
};

export function BookingRequested({ event, baseUrl }: Props) {
  const requestsUrl = `${baseUrl}/app/${event.payload.orgSlug}/requests`;

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
      </SlackBody>
      <SlackFooter>
        {i18n.t('notifications:booking.requestedContext', {
          date: formatDate(event.payload.commuteDate),
          tripType: localizeTripType(event.payload.tripType),
        })}
      </SlackFooter>
    </Blocks>
  );
}
