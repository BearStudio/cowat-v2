import type { LanguageKey } from '@/lib/i18n/constants';

import type { BookingRequestedEvent } from '@/server/notifications/types';

import {
  contextBlock,
  formatDate,
  localizeTripType,
  type SlackBlock,
  t,
  textBlock,
} from './utils';

export function bookingRequested(
  event: BookingRequestedEvent,
  locale: LanguageKey
): SlackBlock[] {
  return [
    textBlock(
      t(locale, 'booking.requested', {
        passengerName: event.payload.passengerName,
      })
    ),
    contextBlock([
      t(locale, 'booking.requestedContext', {
        date: formatDate(event.payload.commuteDate, locale),
        tripType: localizeTripType(locale, event.payload.tripType),
      }),
    ]),
  ];
}
