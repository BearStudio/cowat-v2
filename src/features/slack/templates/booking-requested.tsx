/** @jsxImportSource jsx-slack */
import { Blocks } from 'jsx-slack';

import type { LanguageKey } from '@/lib/i18n/constants';

import type { BookingRequestedEvent } from '@/server/notifications/types';

import { SimpleNotification } from './components';
import { formatDate, localizeTripType, t } from './utils';

type Props = { event: BookingRequestedEvent; locale: LanguageKey };

export function BookingRequested({ event, locale }: Props) {
  return (
    <Blocks>
      <SimpleNotification
        text={t(locale, 'booking.requested', {
          passengerName: event.payload.passengerName,
        })}
        context={t(locale, 'booking.requestedContext', {
          date: formatDate(event.payload.commuteDate, locale),
          tripType: localizeTripType(locale, event.payload.tripType),
        })}
      />
    </Blocks>
  );
}
