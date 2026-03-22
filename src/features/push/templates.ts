import dayjsBase from 'dayjs';
import { match } from 'ts-pattern';
import 'dayjs/locale/en.js';
import 'dayjs/locale/fr.js';

import { getDateFormat } from '@/lib/dayjs/formats';
import i18n from '@/lib/i18n';
import type { LanguageKey } from '@/lib/i18n/constants';

import { envClient } from '@/env/client';
import type { NotificationEvent } from '@/server/notifications/types';

export type PushContent = {
  title: string;
  body: string;
  link?: string;
};

export function getPushContent(
  event: NotificationEvent,
  locale: LanguageKey
): PushContent | null {
  const formatDate = (date: Date) =>
    dayjsBase(date).locale(locale).format(getDateFormat('notification'));

  const t = (key: string, options?: Record<string, string>): string =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (i18n.t as any)(key, { ...options, lng: locale });

  return match(event)
    .with({ type: 'booking.requested' }, (e) => ({
      title: t('notifications:push.booking.requested.title'),
      body: t('notifications:push.booking.requested.body', {
        passengerName: e.payload.passengerName,
        date: formatDate(e.payload.commuteDate),
      }),
      link: `${envClient.VITE_BASE_URL}/${e.payload.orgSlug}`,
    }))
    .with({ type: 'booking.accepted' }, (e) => ({
      title: t('notifications:push.booking.accepted.title'),
      body: t('notifications:push.booking.accepted.body', {
        driverName: e.payload.driverName,
        date: formatDate(e.payload.commuteDate),
      }),
      link: `${envClient.VITE_BASE_URL}/${e.payload.orgSlug}`,
    }))
    .with({ type: 'booking.refused' }, (e) => ({
      title: t('notifications:push.booking.refused.title'),
      body: t('notifications:push.booking.refused.body', {
        driverName: e.payload.driverName,
        date: formatDate(e.payload.commuteDate),
      }),
      link: `${envClient.VITE_BASE_URL}/${e.payload.orgSlug}`,
    }))
    .with({ type: 'booking.canceled' }, (e) => ({
      title: t('notifications:push.booking.canceled.title'),
      body: t('notifications:push.booking.canceled.body', {
        passengerName: e.payload.passengerName,
        date: formatDate(e.payload.commuteDate),
      }),
      link: `${envClient.VITE_BASE_URL}/${e.payload.orgSlug}`,
    }))
    .with({ type: 'commute.updated' }, (e) => ({
      title: t('notifications:push.commute.updated.title'),
      body: t('notifications:push.commute.updated.body', {
        driverName: e.payload.driverName,
        date: formatDate(e.payload.commuteDate),
      }),
      link: `${envClient.VITE_BASE_URL}/${e.payload.orgSlug}`,
    }))
    .with({ type: 'commute.canceled' }, (e) => ({
      title: t('notifications:push.commute.canceled.title'),
      body: t('notifications:push.commute.canceled.body', {
        driverName: e.payload.driverName,
        date: formatDate(e.payload.commuteDate),
      }),
      link: `${envClient.VITE_BASE_URL}/${e.payload.orgSlug}`,
    }))
    .with({ type: 'commute.created' }, () => null)
    .with({ type: 'commute.requested' }, () => null)
    .exhaustive();
}
