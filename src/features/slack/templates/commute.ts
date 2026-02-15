import type { LanguageKey } from '@/lib/i18n/constants';
import type {
  CommuteCanceledEvent,
  CommuteCreatedEvent,
  CommuteUpdatedEvent,
} from '@/server/notifications/types';

import { formatDate, localizeCommuteType, t } from './utils';

export function commuteCreated(
  event: CommuteCreatedEvent,
  locale: LanguageKey,
  driverSlackId?: string
): string {
  const driver = driverSlackId
    ? `<@${driverSlackId}>`
    : `*${event.payload.driverName}*`;

  return t(locale, 'commute.created', {
    driver,
    commuteType: localizeCommuteType(locale, event.payload.commuteType),
    date: formatDate(event.payload.commuteDate, locale),
  });
}

export function commuteUpdated(
  event: CommuteUpdatedEvent,
  locale: LanguageKey
): string {
  return t(locale, 'commute.updated', {
    driverName: `*${event.payload.driverName}*`,
    commuteType: localizeCommuteType(locale, event.payload.commuteType),
    date: formatDate(event.payload.commuteDate, locale),
  });
}

export function commuteCanceled(
  event: CommuteCanceledEvent,
  locale: LanguageKey
): string {
  return t(locale, 'commute.canceled', {
    driverName: `*${event.payload.driverName}*`,
    commuteType: localizeCommuteType(locale, event.payload.commuteType),
    date: formatDate(event.payload.commuteDate, locale),
  });
}
