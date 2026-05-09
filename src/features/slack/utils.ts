import i18n from '@/lib/i18n';
import type { LanguageKey } from '@/lib/i18n/constants';

import type { TripType } from '@/features/booking/schema';
import type { CommuteType } from '@/features/commute/schema';
export type SlackBlock = {
  type: string;
  [key: string]: unknown;
};

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

const dateFormatters: Record<LanguageKey, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat('en', DATE_FORMAT_OPTIONS),
  fr: new Intl.DateTimeFormat('fr', DATE_FORMAT_OPTIONS),
};

const getDateFormatter = (locale: string): Intl.DateTimeFormat =>
  dateFormatters[locale as LanguageKey] ?? dateFormatters.en;

export function formatDate(commuteDate: Date): string {
  const date =
    commuteDate instanceof Date ? commuteDate : new Date(String(commuteDate));

  return getDateFormatter(i18n.language).format(date);
}

export function localizeCommuteType(type: CommuteType): string {
  return i18n.t(`notifications:commuteType.${type}`);
}

export function localizeTripType(type: TripType): string {
  return i18n.t(`notifications:tripType.${type}`);
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
