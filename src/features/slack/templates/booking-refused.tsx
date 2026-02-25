/** @jsxImportSource jsx-slack */
import { Blocks, Button } from 'jsx-slack';

import i18n from '@/lib/i18n';

import { SlackBody } from '@/features/slack/components/body';
import { SlackFooter } from '@/features/slack/components/footer';
import { SlackHeader } from '@/features/slack/components/header';
import type { BookingRefusedEvent } from '@/server/notifications/types';

import { formatDate, localizeTripType } from '../utils';

type Props = {
  event: BookingRefusedEvent;
  baseUrl: string;
};

export function BookingRefused({ event, baseUrl }: Props) {
  const dashboardUrl = `${baseUrl}/app/${event.payload.orgSlug}`;

  return (
    <Blocks>
      <SlackHeader
        aside={
          <Button url={dashboardUrl}>
            {i18n.t('notifications:common.viewDashboard')}
          </Button>
        }
      >
        {i18n.t('notifications:booking.refused.headline')}
      </SlackHeader>
      <SlackBody>
        {i18n.t('notifications:booking.refused.body', {
          driverName: event.payload.driverName,
        })}
      </SlackBody>
      <SlackFooter>
        {i18n.t('notifications:booking.refusedContext', {
          date: formatDate(event.payload.commuteDate),
          tripType: localizeTripType(event.payload.tripType),
        })}
      </SlackFooter>
    </Blocks>
  );
}
