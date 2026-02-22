import type { LanguageKey } from '@/lib/i18n/constants';

import type { BookingAcceptedEvent } from '@/server/notifications/types';

import {
  formatDate,
  localizeTripType,
  type SlackBlock,
  t,
  textBlock,
} from './utils';

export function bookingAccepted(
  event: BookingAcceptedEvent,
  locale: LanguageKey
): SlackBlock[] {
  return [
    textBlock(
      t(locale, 'booking.accepted', {
        driverName: event.payload.driverName,
        tripType: localizeTripType(locale, event.payload.tripType),
        date: formatDate(event.payload.commuteDate, locale),
      })
    ),
  ];
}
