import type { CommuteType } from '@/features/commute/schema';
import type { LanguageKey } from '@/lib/i18n/constants';
import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';
import en from '@/locales/en/notifications.json' with { type: 'json' };
import fr from '@/locales/fr/notifications.json' with { type: 'json' };
import type { NotificationEvent } from '@/server/notifications/types';

const translations: Record<LanguageKey, typeof en> = { en, fr };

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
  return commuteDate instanceof Date
    ? commuteDate.toLocaleDateString(locale)
    : String(commuteDate);
}

export function localizeCommuteType(
  locale: LanguageKey,
  type: CommuteType
): string {
  return t(locale, `commuteType.${type}`);
}
