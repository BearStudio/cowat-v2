import type { LanguageKey } from '@/lib/i18n/constants';

import type {
  BookingAcceptedEvent,
  BookingCanceledEvent,
  BookingRefusedEvent,
  BookingRequestedEvent,
} from '@/server/notifications/types';

import { formatDate, localizeCommuteType, t } from './utils';

export function bookingRequested(
  event: BookingRequestedEvent,
  locale: LanguageKey
): string {
  return t(locale, 'booking.requested', {
    passengerName: `*${event.payload.passengerName}*`,
    commuteType: localizeCommuteType(locale, event.payload.commuteType),
    date: formatDate(event.payload.commuteDate, locale),
  });
}

export function bookingAccepted(
  event: BookingAcceptedEvent,
  locale: LanguageKey
): string {
  return t(locale, 'booking.accepted', {
    driverName: `*${event.payload.driverName}*`,
    commuteType: localizeCommuteType(locale, event.payload.commuteType),
    date: formatDate(event.payload.commuteDate, locale),
  });
}

export function bookingRefused(
  event: BookingRefusedEvent,
  locale: LanguageKey
): string {
  return t(locale, 'booking.refused', {
    driverName: `*${event.payload.driverName}*`,
    commuteType: localizeCommuteType(locale, event.payload.commuteType),
    date: formatDate(event.payload.commuteDate, locale),
  });
}

export function bookingCanceled(
  event: BookingCanceledEvent,
  locale: LanguageKey
): string {
  return t(locale, 'booking.canceled', {
    passengerName: `*${event.payload.passengerName}*`,
    commuteType: localizeCommuteType(locale, event.payload.commuteType),
    date: formatDate(event.payload.commuteDate, locale),
  });
}
