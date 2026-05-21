/**
 * Multi-language related operations
 */
import type { LocaleType } from '@grow-admin-rock/types';
import { Ref, unref } from 'vue';
import { loadLocalePool, setHtmlPageLang } from './helper';
import { getLocale, setLocale } from './store';
import { Lib } from '#/../library';
import { diKT } from '@grow-admin-rock/ioc';

interface LangModule {
  message: Recordable<any>;
}

const i18n = () => diKT(Lib.types.I18n);

function setI18nLanguage(locale: LocaleType) {
  (i18n().global.locale as any).value = locale;
  setLocale(locale);
  setHtmlPageLang(locale);
}

export type LocalOperator = {
  getLocale: Ref<LocaleType>;
  changeLocale: (locale: LocaleType) => Promise<LocaleType | undefined>;
};

export const useLocale = (): LocalOperator => {
  // Switching the language will change the locale of useI18n
  // And submit to configuration modification
  const changeLocale = async (locale: LocaleType) => {
    const globalI18n = i18n().global;
    const currentLocale = unref(globalI18n.locale);

    if (currentLocale === locale) {
      return locale;
    }

    if (loadLocalePool.includes(locale)) {
      setI18nLanguage(locale);
      return locale;
    }

    const langModule = ((await import(`./lang/${locale}.ts`)) as any)
      .default as LangModule;

    if (!langModule) {
      return;
    }

    const { message } = langModule;

    globalI18n.setLocaleMessage(locale, message);
    loadLocalePool.push(locale);

    setI18nLanguage(locale);
    return locale;
  };

  return {
    getLocale,
    changeLocale,
  };
};
