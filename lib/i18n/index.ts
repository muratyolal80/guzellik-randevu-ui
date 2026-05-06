/**
 * Lightweight i18n helper — `next-intl` kurulana kadar geçici çözüm.
 * Kullanım:
 *   import { t } from '@/lib/i18n';
 *   t('booking.bookNow');  // → "Randevu Al"
 *
 * İleride next-intl kurulduğunda:
 *   import { useTranslations } from 'next-intl';
 *   const t = useTranslations();
 *   t('booking.bookNow');
 */
import tr from '@/messages/tr.json';

type LocaleMessages = typeof tr;
type DotPath<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends object
    ? DotPath<T[K], `${P}${K}.`> | `${P}${K}`
    : `${P}${K}`;
}[keyof T & string];

export type MessageKey = DotPath<LocaleMessages>;

const messages: Record<string, LocaleMessages> = { tr };
const DEFAULT_LOCALE = 'tr';

export function t(key: MessageKey, locale: string = DEFAULT_LOCALE): string {
  const dict = messages[locale] || messages[DEFAULT_LOCALE];
  const segments = key.split('.');
  let cur: any = dict;
  for (const seg of segments) {
    if (cur && typeof cur === 'object' && seg in cur) {
      cur = cur[seg];
    } else {
      return key; // fallback: anahtarı döndür
    }
  }
  return typeof cur === 'string' ? cur : key;
}
