/** @jsxImportSource jsx-slack */
import { Blocks } from 'jsx-slack';

import type { LanguageKey } from '@/lib/i18n/constants';

import type { BookingAcceptedEvent } from '@/server/notifications/types';

import { SimpleNotification } from './components';
import { formatDate, localizeTripType, t } from './utils';

type Props = { event: BookingAcceptedEvent; locale: LanguageKey };

export function BookingAccepted({ event, locale }: Props) {
  return (
    <Blocks>
      <SimpleNotification
        text={t(locale, 'booking.accepted', {
          driverName: event.payload.driverName,
        })}
        context={t(locale, 'booking.acceptedContext', {
          date: formatDate(event.payload.commuteDate, locale),
          tripType: localizeTripType(locale, event.payload.tripType),
        })}
      />
    </Blocks>
  );
}
