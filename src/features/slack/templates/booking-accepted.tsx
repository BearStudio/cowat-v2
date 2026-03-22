/** @jsxImportSource jsx-slack */
import { Blocks, Button } from 'jsx-slack';

import i18n from '@/lib/i18n';
import { routeUrl } from '@/lib/route-url';

import { SlackBody } from '@/features/slack/components/body';
import { SlackFooter } from '@/features/slack/components/footer';
import { SlackHeader } from '@/features/slack/components/header';
import type { BookingAcceptedEvent } from '@/server/notifications/types';

import { formatDate, localizeTripType } from '../utils';

type Props = {
  event: BookingAcceptedEvent;
  baseUrl: string;
};

export function BookingAccepted({ event, baseUrl }: Props) {
  const commutesUrl = routeUrl(baseUrl, '/app/$orgSlug/commutes', {
    params: { orgSlug: event.payload.orgSlug },
  });

  return (
    <Blocks>
      <SlackHeader
        aside={
          <Button url={commutesUrl}>
            {i18n.t('notifications:booking.viewCommutes')}
          </Button>
        }
      >
        {i18n.t('notifications:booking.accepted.headline')}
      </SlackHeader>
      <SlackBody>
        {i18n.t('notifications:booking.accepted.body', {
          driverName: event.payload.driverName,
        })}
      </SlackBody>
      <SlackFooter>
        {i18n.t('notifications:booking.acceptedContext', {
          date: formatDate(event.payload.commuteDate),
          tripType: localizeTripType(event.payload.tripType),
        })}
      </SlackFooter>
    </Blocks>
  );
}
