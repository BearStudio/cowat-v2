import type { LanguageKey } from '@/lib/i18n/constants';
import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

import type { NotificationEvent } from '@/server/notifications/types';

import { bookingAccepted } from './booking-accepted';
import { bookingCanceled } from './booking-canceled';
import { bookingRefused } from './booking-refused';
import { bookingRequested } from './booking-requested';
import { commuteCanceled } from './commute-canceled';
import { commuteCreated } from './commute-created';
import { commuteRequested } from './commute-requested';
import { commuteUpdated } from './commute-updated';
import type { SlackBlock } from './utils';

export type { SlackBlock };
export { getFallbackText } from './utils';

export function getSlackBlocks(
  event: NotificationEvent,
  opts?: {
    driverSlackId?: string;
    driverAvatarUrl?: string;
    requesterSlackId?: string;
    baseUrl?: string;
    locale?: LanguageKey;
  }
): SlackBlock[] {
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
      return commuteCreated(
        event,
        locale,
        opts?.driverSlackId,
        opts?.driverAvatarUrl
      );
    case 'commute.updated':
      return commuteUpdated(event, locale);
    case 'commute.canceled':
      return commuteCanceled(event, locale);
    case 'commute.requested':
      return commuteRequested(
        event,
        locale,
        opts?.baseUrl ?? '',
        opts?.requesterSlackId
      );
  }
}
