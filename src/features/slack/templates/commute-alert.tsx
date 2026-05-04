/** @jsxImportSource jsx-slack */
import { t } from 'i18next';
import { Blocks, Section } from 'jsx-slack';

import { SlackFooter } from '@/features/slack/components/footer';
import { SlackHeader } from '@/features/slack/components/header';
import type { CommuteAlertEvent } from '@/server/notifications/types';

import { formatDate, localizeTripType } from '../utils';

type Props = {
  event: CommuteAlertEvent;
};

export function CommuteAlert({ event }: Props) {
  const {
    senderName,
    alertType,
    lateMinutes,
    commuteDate,
    customMessage,
    tripType,
  } = event.payload;

  const message = t(`notifications:push.commute.alert.${alertType}`, {
    senderName,
    lateMinutes,
    customMessage,
  });

  return (
    <Blocks>
      <SlackHeader>{t('notifications:push.commute.headline')}</SlackHeader>
      <Section>
        <>{message}</>
      </Section>
      <SlackFooter>
        {t('notifications:push.commute.footer', {
          date: formatDate(commuteDate),
          tripType: localizeTripType(tripType),
        })}
      </SlackFooter>
    </Blocks>
  );
}
