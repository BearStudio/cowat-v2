/** @jsxImportSource jsx-slack */
import type JSXSlack from 'jsx-slack';
import { match } from 'ts-pattern';

import type { LanguageKey } from '@/lib/i18n/constants';
import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

import type {
  BookingAcceptedEvent,
  BookingCanceledEvent,
  BookingRefusedEvent,
  BookingRequestedEvent,
  CommuteCanceledEvent,
  CommuteCreatedEvent,
  CommuteRequestedEvent,
  CommuteUpdatedEvent,
} from '@/server/notifications/types';

import { BookingAccepted } from './booking-accepted';
import { BookingCanceled } from './booking-canceled';
import { BookingRefused } from './booking-refused';
import { BookingRequested } from './booking-requested';
import { CommuteCanceled } from './commute-canceled';
import { CommuteCreated } from './commute-created';
import { CommuteRequested } from './commute-requested';
import { CommuteUpdated } from './commute-updated';
import type { SlackBlock } from './utils';

export type { SlackBlock };
export { getFallbackText } from './utils';

export type BroadcastEvent = CommuteCreatedEvent | CommuteRequestedEvent;

export type PrivateEvent =
  | BookingRequestedEvent
  | BookingAcceptedEvent
  | BookingRefusedEvent
  | BookingCanceledEvent
  | CommuteUpdatedEvent
  | CommuteCanceledEvent;

export type BroadcastOpts = {
  driverSlackId?: string;
  driverAvatarUrl?: string;
  requesterSlackId?: string;
  baseUrl?: string;
  locale?: LanguageKey;
};

export function getBroadcastBlocks(
  event: BroadcastEvent,
  opts?: BroadcastOpts
): JSXSlack.JSX.Element {
  const locale = opts?.locale ?? DEFAULT_LANGUAGE_KEY;

  return match(event)
    .with({ type: 'commute.created' }, (e) => (
      <CommuteCreated
        event={e}
        locale={locale}
        baseUrl={opts?.baseUrl ?? ''}
        driverSlackId={opts?.driverSlackId}
        driverAvatarUrl={opts?.driverAvatarUrl}
      />
    ))
    .with({ type: 'commute.requested' }, (e) => (
      <CommuteRequested
        event={e}
        locale={locale}
        baseUrl={opts?.baseUrl ?? ''}
        requesterSlackId={opts?.requesterSlackId}
      />
    ))
    .exhaustive();
}

export function getPrivateBlocks(
  event: PrivateEvent,
  opts?: { locale?: LanguageKey; baseUrl?: string }
): JSXSlack.JSX.Element {
  const locale = opts?.locale ?? DEFAULT_LANGUAGE_KEY;

  return match(event)
    .with({ type: 'booking.requested' }, (e) => (
      <BookingRequested
        event={e}
        locale={locale}
        baseUrl={opts?.baseUrl ?? ''}
      />
    ))
    .with({ type: 'booking.accepted' }, (e) => (
      <BookingAccepted event={e} locale={locale} />
    ))
    .with({ type: 'booking.refused' }, (e) => (
      <BookingRefused event={e} locale={locale} />
    ))
    .with({ type: 'booking.canceled' }, (e) => (
      <BookingCanceled event={e} locale={locale} />
    ))
    .with({ type: 'commute.updated' }, (e) => (
      <CommuteUpdated event={e} locale={locale} />
    ))
    .with({ type: 'commute.canceled' }, (e) => (
      <CommuteCanceled event={e} locale={locale} />
    ))
    .exhaustive();
}
