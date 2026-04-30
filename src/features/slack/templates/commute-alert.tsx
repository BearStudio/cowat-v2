/** @jsxImportSource jsx-slack */
import { Blocks, Section } from 'jsx-slack';

import i18n from '@/lib/i18n';

import { SlackFooter } from '@/features/slack/components/footer';
import { SlackHeader } from '@/features/slack/components/header';
import type { CommuteAlertEvent } from '@/server/notifications/types';

import { formatDate, localizeTripType } from '../utils';

type Props = {
  event: CommuteAlertEvent;
  baseUrl: string;
};

// eslint-disable-next-line no-unused-vars
export function CommuteAlert({ event, baseUrl }: Props) {
  const {
    senderName,
    alertType,
    lateMinutes,
    commuteDate,
    customMessage,
    tripType,
  } = event.payload;

  const message =
    alertType === 'late'
      ? `*${senderName}*  sera en retard de *${lateMinutes} minutes*.`
      : alertType === 'arrived'
        ? `*${senderName}* est arrivé au point de rendez-vous.`
        : `*${senderName}* a envoyé un message personnalisé : ${customMessage}`;

  return (
    <Blocks>
      <SlackHeader>{i18n.t('notifications:push.commute.headline')}</SlackHeader>
      <Section>
        <>{message}</>
      </Section>
      <SlackFooter>
        {i18n.t('notifications:push.commute.footer', {
          date: formatDate(commuteDate),
          tripType: localizeTripType(tripType),
        })}
      </SlackFooter>
    </Blocks>
  );
}
