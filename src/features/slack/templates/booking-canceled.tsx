/** @jsxImportSource jsx-slack */
import { Blocks } from 'jsx-slack';

import type { LanguageKey } from '@/lib/i18n/constants';

import type { BookingCanceledEvent } from '@/server/notifications/types';

import { SimpleNotification } from './components';
import { formatDate, localizeTripType, t } from './utils';

type Props = { event: BookingCanceledEvent; locale: LanguageKey };

export function BookingCanceled({ event, locale }: Props) {
  return (
    <Blocks>
      <SimpleNotification
        text={t(locale, 'booking.canceled', {
          passengerName: event.payload.passengerName,
        })}
        context={t(locale, 'booking.canceledContext', {
          date: formatDate(event.payload.commuteDate, locale),
          tripType: localizeTripType(locale, event.payload.tripType),
        })}
      />
    </Blocks>
  );
}
