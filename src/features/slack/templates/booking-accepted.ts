import type { LanguageKey } from '@/lib/i18n/constants';

import type { BookingAcceptedEvent } from '@/server/notifications/types';

import {
  contextBlock,
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
      })
    ),
    contextBlock([
      t(locale, 'booking.acceptedContext', {
        date: formatDate(event.payload.commuteDate, locale),
        tripType: localizeTripType(locale, event.payload.tripType),
      }),
    ]),
  ];
}
