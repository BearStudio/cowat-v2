/** @jsxImportSource jsx-slack */
import { Blocks } from 'jsx-slack';

import type { LanguageKey } from '@/lib/i18n/constants';

import type { BookingRefusedEvent } from '@/server/notifications/types';

import { SimpleNotification } from './components';
import { formatDate, localizeTripType, t } from './utils';

type Props = { event: BookingRefusedEvent; locale: LanguageKey };

export function BookingRefused({ event, locale }: Props) {
  return (
    <Blocks>
      <SimpleNotification
        text={t(locale, 'booking.refused', {
          driverName: event.payload.driverName,
        })}
        context={t(locale, 'booking.refusedContext', {
          date: formatDate(event.payload.commuteDate, locale),
          tripType: localizeTripType(locale, event.payload.tripType),
        })}
      />
    </Blocks>
  );
}
