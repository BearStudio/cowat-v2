import type { LanguageKey } from '@/lib/i18n/constants';

import type { BookingCanceledEvent } from '@/server/notifications/types';

import {
  contextBlock,
  formatDate,
  localizeTripType,
  type SlackBlock,
  t,
  textBlock,
} from './utils';

export function bookingCanceled(
  event: BookingCanceledEvent,
  locale: LanguageKey
): SlackBlock[] {
  return [
    textBlock(
      t(locale, 'booking.canceled', {
        passengerName: event.payload.passengerName,
      })
    ),
    contextBlock([
      t(locale, 'booking.canceledContext', {
        date: formatDate(event.payload.commuteDate, locale),
        tripType: localizeTripType(locale, event.payload.tripType),
      }),
    ]),
  ];
}
