/** @jsxImportSource jsx-slack */
import { Blocks, Divider, Section } from 'jsx-slack';

import { SlackFooter } from '@/features/slack/components/footer';
import { SlackHeader } from '@/features/slack/components/header';
import type { CommuteAlertEvent } from '@/server/notifications/types';

import { formatDate } from '../utils';

type Props = {
  event: CommuteAlertEvent;
  baseUrl: string;
};

// eslint-disable-next-line no-unused-vars
export function CommuteAlert({ event, baseUrl }: Props) {
  // eslint-disable-next-line no-unused-vars
  const { senderName, alertType, lateMinutes, commuteDate } = event.payload;

  const message =
    alertType === 'late'
      ? '{{name}} sera en retard de {{minutes}} minutes.'
      : alertType === 'arrived'
        ? '{{name}} est arrivé au point de rendez-vous.'
        : '{{name}} a envoyé un message personnalisé.';

  return (
    <Blocks>
      <SlackHeader>Alerte trajet</SlackHeader>
      <Section>
        <>{message}</>
      </Section>
      <Divider />
      <SlackFooter>{formatDate(commuteDate)}</SlackFooter>
    </Blocks>
  );
}
