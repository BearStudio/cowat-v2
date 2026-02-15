import type { LanguageKey } from '@/lib/i18n/constants';
import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

import type { NotificationEvent } from '@/server/notifications/types';

import {
  bookingAccepted,
  bookingCanceled,
  bookingRefused,
  bookingRequested,
} from './booking';
import { commuteCanceled, commuteCreated, commuteUpdated } from './commute';

export function getSlackTemplate(
  event: NotificationEvent,
  opts?: { driverSlackId?: string; locale?: LanguageKey }
): string {
  const locale = opts?.locale ?? DEFAULT_LANGUAGE_KEY;

  switch (event.type) {
    case 'booking.requested':
      return bookingRequested(event, locale);
    case 'booking.accepted':
      return bookingAccepted(event, locale);
    case 'booking.refused':
      return bookingRefused(event, locale);
    case 'booking.canceled':
      return bookingCanceled(event, locale);
    case 'commute.created':
      return commuteCreated(event, locale, opts?.driverSlackId);
    case 'commute.updated':
      return commuteUpdated(event, locale);
    case 'commute.canceled':
      return commuteCanceled(event, locale);
  }
}
