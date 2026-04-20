/** @jsxImportSource jsx-slack */
import { Blocks, Button, Divider, Section } from 'jsx-slack';

import i18n from '@/lib/i18n';
import { routeUrl } from '@/lib/route-url';

import { SlackFooter } from '@/features/slack/components/footer';
import { SlackHeader } from '@/features/slack/components/header';
import {
  type CommuteReminderEvent,
  getCommutesForRecipient,
  type ReminderCommute,
} from '@/server/notifications/types';

import { formatDate } from '../utils';

type Props = {
  event: CommuteReminderEvent;
  baseUrl: string;
  recipientUserId: string;
};

function formatCommuteLineForRecipient(
  commute: ReminderCommute,
  recipientUserId: string
): string {
  const isDriver = commute.driverUserId === recipientUserId;
  const date = formatDate(commute.date);
  const passengerNames = commute.passengers.map((p) => p.name).join(', ');

  if (isDriver) {
    return i18n.t('notifications:commute.reminder.lineDriverWithPassengers', {
      date,
      passengers: passengerNames,
    });
  }

  return i18n.t('notifications:commute.reminder.linePassenger', {
    date,
    driverName: commute.driverName,
  });
}

export function CommuteReminder({ event, baseUrl, recipientUserId }: Props) {
  const { payload } = event;

  const recipientCommutes = getCommutesForRecipient(
    payload.commutes,
    recipientUserId
  );

  const link = routeUrl(baseUrl, '/app/$orgSlug', {
    params: { orgSlug: payload.orgSlug },
  });

  return (
    <Blocks>
      <SlackHeader
        aside={
          <Button url={link}>
            {i18n.t('notifications:commute.viewCommutes')}
          </Button>
        }
      >
        <>{i18n.t('notifications:commute.reminder.headline')}</>
      </SlackHeader>
      <Section>
        <>{i18n.t('notifications:commute.reminder.body')}</>
      </Section>
      <Divider />
      {recipientCommutes.map((commute, idx) => (
        <Section id={`commute-${idx}`}>
          <>{formatCommuteLineForRecipient(commute, recipientUserId)}</>
        </Section>
      ))}
      <SlackFooter>
        {i18n.t('notifications:commute.reminderContext', {
          count: recipientCommutes.length,
        })}
      </SlackFooter>
    </Blocks>
  );
}
