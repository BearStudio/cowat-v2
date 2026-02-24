/** @jsxImportSource jsx-slack */
import { Blocks, Button } from 'jsx-slack';

import type { LanguageKey } from '@/lib/i18n/constants';

import type { BookingRequestedEvent } from '@/server/notifications/types';

import { SimpleNotification } from './components';
import { formatDate, localizeTripType, t } from './utils';

type Props = {
  event: BookingRequestedEvent;
  locale: LanguageKey;
  baseUrl: string;
};

export function BookingRequested({ event, locale, baseUrl }: Props) {
  const requestsUrl = `${baseUrl}/app/${event.payload.orgSlug}/requests`;

  return (
    <Blocks>
      <SimpleNotification
        text={t(locale, 'booking.requested', {
          passengerName: event.payload.passengerName,
        })}
        context={t(locale, 'booking.requestedContext', {
          date: formatDate(event.payload.commuteDate, locale),
          tripType: localizeTripType(locale, event.payload.tripType),
        })}
        action={
          <Button url={requestsUrl}>{t(locale, 'booking.viewRequests')}</Button>
        }
      />
    </Blocks>
  );
}
