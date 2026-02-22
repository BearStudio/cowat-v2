import type { LanguageKey } from '@/lib/i18n/constants';

import type { BookingRefusedEvent } from '@/server/notifications/types';

import {
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
        tripType: localizeTripType(locale, event.payload.tripType),
        date: formatDate(event.payload.commuteDate, locale),
      })
    ),
  ];
}
