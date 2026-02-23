/** @jsxImportSource jsx-slack */
import { Blocks } from 'jsx-slack';

import type { LanguageKey } from '@/lib/i18n/constants';

import type { CommuteCanceledEvent } from '@/server/notifications/types';

import { SimpleNotification } from './components';
import { formatDate, localizeCommuteType, t } from './utils';

type Props = { event: CommuteCanceledEvent; locale: LanguageKey };

export function CommuteCanceled({ event, locale }: Props) {
  return (
    <Blocks>
      <SimpleNotification
        text={t(locale, 'commute.canceled', {
          driverName: event.payload.driverName,
          commuteType: localizeCommuteType(locale, event.payload.commuteType),
        })}
        context={t(locale, 'commute.canceledContext', {
          date: formatDate(event.payload.commuteDate, locale),
        })}
      />
    </Blocks>
  );
}
