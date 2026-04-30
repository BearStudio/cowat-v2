import dayjsBase from 'dayjs';
import { Match } from 'effect';
import 'dayjs/locale/en.js';
import 'dayjs/locale/fr.js';

import { getDateFormat } from '@/lib/dayjs/formats';
import i18n from '@/lib/i18n';
import type { LanguageKey } from '@/lib/i18n/constants';
import { routeUrl } from '@/lib/route-url';

import {
  getCommutesForRecipient,
  type NotificationEvent,
} from '@/server/notifications/types';

type PushContent = {
  title: string;
  body: string;
  link?: string;
};

export function getPushContent(
  event: NotificationEvent,
  locale: LanguageKey,
  baseUrl: string,
  recipientUserId?: string
): PushContent | null {
  const formatDate = (date: Date) =>
    dayjsBase(date).locale(locale).format(getDateFormat('notification'));

  const t = (key: string, options?: Record<string, string>): string =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (i18n.t as any)(key, { ...options, lng: locale });

  return Match.value(event).pipe(
    Match.when({ type: 'booking.requested' }, (e) => ({
      title: t('notifications:push.booking.requested.title'),
      body: t('notifications:push.booking.requested.body', {
        passengerName: e.payload.passengerName,
        date: formatDate(e.payload.commuteDate),
      }),
      link: routeUrl(baseUrl, '/app/$orgSlug', {
        params: { orgSlug: e.payload.orgSlug },
      }),
    })),
    Match.when({ type: 'booking.accepted' }, (e) => ({
      title: t('notifications:push.booking.accepted.title'),
      body: t('notifications:push.booking.accepted.body', {
        driverName: e.payload.driverName,
        date: formatDate(e.payload.commuteDate),
      }),
      link: routeUrl(baseUrl, '/app/$orgSlug', {
        params: { orgSlug: e.payload.orgSlug },
      }),
    })),
    Match.when({ type: 'booking.refused' }, (e) => ({
      title: t('notifications:push.booking.refused.title'),
      body: t('notifications:push.booking.refused.body', {
        driverName: e.payload.driverName,
        date: formatDate(e.payload.commuteDate),
      }),
      link: routeUrl(baseUrl, '/app/$orgSlug', {
        params: { orgSlug: e.payload.orgSlug },
      }),
    })),
    Match.when({ type: 'booking.canceled' }, (e) => ({
      title: t('notifications:push.booking.canceled.title'),
      body: t('notifications:push.booking.canceled.body', {
        passengerName: e.payload.passengerName,
        date: formatDate(e.payload.commuteDate),
      }),
      link: routeUrl(baseUrl, '/app/$orgSlug', {
        params: { orgSlug: e.payload.orgSlug },
      }),
    })),
    Match.when({ type: 'booking.canceledByDriver' }, (e) => ({
      title: t('notifications:push.booking.canceledByDriver.title'),
      body: t('notifications:push.booking.canceledByDriver.body', {
        driverName: e.payload.driverName,
        date: formatDate(e.payload.commuteDate),
      }),
      link: routeUrl(baseUrl, '/app/$orgSlug', {
        params: { orgSlug: e.payload.orgSlug },
      }),
    })),
    Match.when({ type: 'commute.updated' }, (e) => ({
      title: t('notifications:push.commute.updated.title'),
      body: t('notifications:push.commute.updated.body', {
        driverName: e.payload.driverName,
        date: formatDate(e.payload.commuteDate),
      }),
      link: routeUrl(baseUrl, '/app/$orgSlug', {
        params: { orgSlug: e.payload.orgSlug },
      }),
    })),
    Match.when({ type: 'commute.canceled' }, (e) => ({
      title: t('notifications:push.commute.canceled.title'),
      body: t('notifications:push.commute.canceled.body', {
        driverName: e.payload.driverName,
        date: formatDate(e.payload.commuteDate),
      }),
      link: routeUrl(baseUrl, '/app/$orgSlug', {
        params: { orgSlug: e.payload.orgSlug },
      }),
    })),
    Match.when({ type: 'commute.reminder' }, (e) => {
      const commutes = recipientUserId
        ? getCommutesForRecipient(e.payload.commutes, recipientUserId)
        : e.payload.commutes;
      return {
        title: t('notifications:push.commute.reminder.title'),
        body: t('notifications:push.commute.reminder.body', {
          count: String(commutes.length),
        }),
        link: routeUrl(baseUrl, '/app/$orgSlug', {
          params: { orgSlug: e.payload.orgSlug },
        }),
      };
    }),
    Match.when({ type: 'commute.created' }, () => null),
    Match.when({ type: 'commute.requested' }, () => null),
    Match.when({ type: 'commute.alert' }, () => null),
    Match.exhaustive
  );
}
