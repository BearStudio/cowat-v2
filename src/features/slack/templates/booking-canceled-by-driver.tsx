/** @jsxImportSource jsx-slack */
import { Blocks, Button } from 'jsx-slack';

import i18n from '@/lib/i18n';
import { routeUrl } from '@/lib/route-url';

import { SlackBody } from '@/features/slack/components/body';
import { SlackFooter } from '@/features/slack/components/footer';
import { SlackHeader } from '@/features/slack/components/header';
import type { BookingCanceledByDriverEvent } from '@/server/notifications/types';

import { formatDate, localizeCommuteType } from '../utils';

type Props = {
  event: BookingCanceledByDriverEvent;
  baseUrl: string;
};

export function BookingCanceledByDriver({ event, baseUrl }: Props) {
  const commutesUrl = routeUrl(baseUrl, '/app/$orgSlug', {
    params: { orgSlug: event.payload.orgSlug },
  });

  return (
    <Blocks>
      <SlackHeader
        aside={
          <Button url={commutesUrl}>
            {i18n.t('notifications:booking.findCommute')}
          </Button>
        }
      >
        {i18n.t('notifications:booking.canceledByDriver.headline')}
      </SlackHeader>
      <SlackBody>
        {i18n.t('notifications:booking.canceledByDriver.body', {
          driverName: event.payload.driverName,
        })}
      </SlackBody>
      <SlackFooter>
        {i18n.t('notifications:booking.canceledByDriverContext', {
          date: formatDate(event.payload.commuteDate),
          commuteType: localizeCommuteType(event.payload.commuteType),
        })}
      </SlackFooter>
    </Blocks>
  );
}
