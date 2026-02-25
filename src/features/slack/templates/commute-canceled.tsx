/** @jsxImportSource jsx-slack */
import { Blocks, Button } from 'jsx-slack';

import i18n from '@/lib/i18n';

import { SlackBody } from '@/features/slack/components/body';
import { SlackFooter } from '@/features/slack/components/footer';
import { SlackHeader } from '@/features/slack/components/header';
import type { CommuteCanceledEvent } from '@/server/notifications/types';

import { formatDate, localizeCommuteType } from '../utils';

type Props = {
  event: CommuteCanceledEvent;
  baseUrl: string;
};

export function CommuteCanceled({ event, baseUrl }: Props) {
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
        {i18n.t('notifications:commute.canceled.headline')}
      </SlackHeader>
      <SlackBody>
        {i18n.t('notifications:commute.canceled.body', {
          driverName: event.payload.driverName,
          commuteType: localizeCommuteType(event.payload.commuteType),
        })}
      </SlackBody>
      <SlackFooter>
        {i18n.t('notifications:commute.canceledContext', {
          date: formatDate(event.payload.commuteDate),
        })}
      </SlackFooter>
    </Blocks>
  );
}
