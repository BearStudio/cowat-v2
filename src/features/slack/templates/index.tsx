/** @jsxImportSource jsx-slack */
import type JSXSlack from 'jsx-slack';
import { match } from 'ts-pattern';

import i18n from '@/lib/i18n';
import type { LanguageKey } from '@/lib/i18n/constants';
import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

import { CommuteAlert } from '@/features/slack/templates/commute-alert';
import type {
  BookingAcceptedEvent,
  BookingCanceledByDriverEvent,
  BookingCanceledEvent,
  BookingRefusedEvent,
  BookingRequestedEvent,
  CommuteAlertEvent,
  CommuteCanceledEvent,
  CommuteCreatedEvent,
  CommuteReminderEvent,
  CommuteRequestedEvent,
  CommuteUpdatedEvent,
} from '@/server/notifications/types';

import { BookingAccepted } from './booking-accepted';
import { BookingCanceled } from './booking-canceled';
import { BookingCanceledByDriver } from './booking-canceled-by-driver';
import { BookingRefused } from './booking-refused';
import { BookingRequested } from './booking-requested';
import { CommuteCanceled } from './commute-canceled';
import { CommuteCreated } from './commute-created';
import { CommuteReminder } from './commute-reminder';
import { CommuteRequested } from './commute-requested';
import { CommuteUpdated } from './commute-updated';
import type { SlackBlock } from '../utils';

export type { SlackBlock };
export { getFallbackText } from '../utils';

export type BroadcastEvent = CommuteCreatedEvent | CommuteRequestedEvent;

export type PrivateEvent =
  | BookingRequestedEvent
  | BookingAcceptedEvent
  | BookingRefusedEvent
  | BookingCanceledEvent
  | BookingCanceledByDriverEvent
  | CommuteUpdatedEvent
  | CommuteCanceledEvent
  | CommuteReminderEvent
  | CommuteAlertEvent;

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
  i18n.changeLanguage(opts?.locale ?? DEFAULT_LANGUAGE_KEY);

  return match(event)
    .with({ type: 'commute.created' }, (e) => (
      <CommuteCreated
        event={e}
        baseUrl={opts?.baseUrl ?? ''}
        driverSlackId={opts?.driverSlackId}
        driverAvatarUrl={opts?.driverAvatarUrl}
      />
    ))
    .with({ type: 'commute.requested' }, (e) => (
      <CommuteRequested
        event={e}
        baseUrl={opts?.baseUrl ?? ''}
        requesterSlackId={opts?.requesterSlackId}
      />
    ))
    .exhaustive();
}

export function getPrivateBlocks(
  event: PrivateEvent,
  opts?: { locale?: LanguageKey; baseUrl?: string; recipientUserId?: string }
): JSXSlack.JSX.Element {
  i18n.changeLanguage(opts?.locale ?? DEFAULT_LANGUAGE_KEY);

  return match(event)
    .with({ type: 'booking.requested' }, (e) => (
      <BookingRequested event={e} baseUrl={opts?.baseUrl ?? ''} />
    ))
    .with({ type: 'booking.accepted' }, (e) => (
      <BookingAccepted event={e} baseUrl={opts?.baseUrl ?? ''} />
    ))
    .with({ type: 'booking.refused' }, (e) => (
      <BookingRefused event={e} baseUrl={opts?.baseUrl ?? ''} />
    ))
    .with({ type: 'booking.canceled' }, (e) => (
      <BookingCanceled event={e} baseUrl={opts?.baseUrl ?? ''} />
    ))
    .with({ type: 'booking.canceledByDriver' }, (e) => (
      <BookingCanceledByDriver event={e} baseUrl={opts?.baseUrl ?? ''} />
    ))
    .with({ type: 'commute.updated' }, (e) => (
      <CommuteUpdated event={e} baseUrl={opts?.baseUrl ?? ''} />
    ))
    .with({ type: 'commute.canceled' }, (e) => (
      <CommuteCanceled event={e} baseUrl={opts?.baseUrl ?? ''} />
    ))
    .with({ type: 'commute.reminder' }, (e) => (
      <CommuteReminder
        event={e}
        baseUrl={opts?.baseUrl ?? ''}
        recipientUserId={opts?.recipientUserId ?? ''}
      />
    ))
    .with({ type: 'commute.alert' }, (e) => (
      <CommuteAlert event={e} baseUrl={opts?.baseUrl ?? ''} />
    ))
    .exhaustive();
}
