import type { LanguageKey } from '@/lib/i18n/constants';

import type { CommuteUpdatedEvent } from '@/server/notifications/types';

import {
  formatDate,
  localizeCommuteType,
  type SlackBlock,
  t,
  textBlock,
} from './utils';

export function commuteUpdated(
  event: CommuteUpdatedEvent,
  locale: LanguageKey
): SlackBlock[] {
  return [
    textBlock(
      t(locale, 'commute.updated', {
        driverName: event.payload.driverName,
        commuteType: localizeCommuteType(locale, event.payload.commuteType),
        date: formatDate(event.payload.commuteDate, locale),
      })
    ),
  ];
}
