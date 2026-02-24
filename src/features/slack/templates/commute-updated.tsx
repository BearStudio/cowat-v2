/** @jsxImportSource jsx-slack */
import { Blocks } from 'jsx-slack';

import type { LanguageKey } from '@/lib/i18n/constants';

import type { CommuteUpdatedEvent } from '@/server/notifications/types';

import { SimpleNotification } from './components';
import { formatDate, localizeCommuteType, t } from './utils';

type Props = { event: CommuteUpdatedEvent; locale: LanguageKey };

export function CommuteUpdated({ event, locale }: Props) {
  return (
    <Blocks>
      <SimpleNotification
        text={t(locale, 'commute.updated', {
          driverName: event.payload.driverName,
          commuteType: localizeCommuteType(locale, event.payload.commuteType),
        })}
        context={t(locale, 'commute.updatedContext', {
          date: formatDate(event.payload.commuteDate, locale),
        })}
      />
    </Blocks>
  );
}
