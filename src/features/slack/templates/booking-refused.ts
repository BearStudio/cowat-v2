import type { LanguageKey } from '@/lib/i18n/constants';

import type { BookingRefusedEvent } from '@/server/notifications/types';

import {
  contextBlock,
  formatDate,
  localizeTripType,
  type SlackBlock,
  t,
  textBlock,
} from './utils';

export function bookingRefused(
  event: BookingRefusedEvent,
  locale: LanguageKey
): SlackBlock[] {
  return [
    textBlock(
      t(locale, 'booking.refused', {
        driverName: event.payload.driverName,
      })
    ),
    contextBlock([
      t(locale, 'booking.refusedContext', {
        date: formatDate(event.payload.commuteDate, locale),
        tripType: localizeTripType(locale, event.payload.tripType),
      }),
    ]),
  ];
}
