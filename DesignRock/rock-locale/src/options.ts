import type { I18nOptions } from 'vue-i18n';
import { localeSetting } from '#/config';
import { getLocale } from '#/store';
import { setHtmlPageLang, setLoadLocalePool } from '#/helper';

const { fallback, availableLocales } = localeSetting;

export const createI18nOptions = async (): Promise<I18nOptions> => {
  const locale = getLocale.value;
  const defaultLocal = await import(`./lang/${locale}.ts`);
  const message = defaultLocal.default?.message ?? {};

  setHtmlPageLang(locale);

  setLoadLocalePool((loadLocalePool) => loadLocalePool.push(locale));

  return {
    legacy: false,
    locale,
    fallbackLocale: fallback,
    messages: {
      [locale]: message,
    },
    availableLocales: availableLocales,
    sync: true,
    silentTranslationWarn: true,
    missingWarn: false,
    silentFallbackWarn: true,
  } as I18nOptions;
};
