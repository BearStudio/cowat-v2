import type { LanguageKey } from '@/lib/i18n/constants';
import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

import type { TripType } from '@/features/booking/schema';
import type { CommuteType } from '@/features/commute/schema';
import en from '@/locales/en/notifications.json' with { type: 'json' };
import fr from '@/locales/fr/notifications.json' with { type: 'json' };
import type { NotificationEvent } from '@/server/notifications/types';

const translations: Record<LanguageKey, typeof en> = { en, fr };

export type SlackBlock = {
  type: string;
  [key: string]: unknown;
};

export function t(
  locale: LanguageKey,
  key: string,
  vars?: Record<string, string>
): string {
  const dict = translations[locale] ?? translations[DEFAULT_LANGUAGE_KEY];

  // Resolve nested key like "booking.requested"
  const template = key.split('.').reduce<unknown>((obj, k) => {
    if (obj && typeof obj === 'object' && k in obj) {
      return (obj as Record<string, unknown>)[k];
    }
    return undefined;
  }, dict);

  if (typeof template !== 'string') return key;

  if (!vars) return template;

  return template.replace(
    /\{\{(\w+)\}\}/g,
    (_, name: string) => vars[name] ?? ''
  );
}

export function formatDate(
  commuteDate: NotificationEvent['payload']['commuteDate'],
  locale: LanguageKey
): string {
  const date =
    commuteDate instanceof Date ? commuteDate : new Date(String(commuteDate));

  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function localizeCommuteType(
  locale: LanguageKey,
  type: CommuteType
): string {
  return t(locale, `commuteType.${type}`);
}

export function localizeTripType(locale: LanguageKey, type: TripType): string {
  return t(locale, `tripType.${type}`);
}

export function getFallbackText(blocks: SlackBlock[]): string {
  for (const block of blocks) {
    if (
      block.type === 'section' &&
      typeof block.text === 'object' &&
      block.text !== null
    ) {
      const text = (block.text as { text?: string }).text;
      if (typeof text === 'string') {
        return text
          .replace(/[*_~`]/g, '')
          .replace(/<@[^>]+>/g, '@user')
          .replace(/<!here>/g, '@here')
          .replace(/<!channel>/g, '@channel')
          .replace(/\n/g, ' ')
          .trim();
      }
    }
  }
  return 'New notification';
}
