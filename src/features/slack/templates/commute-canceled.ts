import type { LanguageKey } from '@/lib/i18n/constants';

import type { CommuteCanceledEvent } from '@/server/notifications/types';

import {
  formatDate,
  localizeCommuteType,
  type SlackBlock,
  t,
  textBlock,
} from './utils';

export function commuteCanceled(
  event: CommuteCanceledEvent,
  locale: LanguageKey
): SlackBlock[] {
  return [
    textBlock(
      t(locale, 'commute.canceled', {
        driverName: event.payload.driverName,
        commuteType: localizeCommuteType(locale, event.payload.commuteType),
        date: formatDate(event.payload.commuteDate, locale),
      })
    ),
  ];
}
