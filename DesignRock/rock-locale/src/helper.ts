import type { LocaleType } from '@grow-admin-rock/types';
import { set } from '@grow-admin-rock/utils';

export const loadLocalePool: LocaleType[] = [];

/**
 * 修改Html的lang属性
 * @param locale
 */
export const setHtmlPageLang = (locale: LocaleType) => {
  document.querySelector('html')?.setAttribute('lang', locale);
};
/**
 * 加载本地语言包
 * @param cb
 */
export const setLoadLocalePool = (
  cb: (loadLocalePool: LocaleType[]) => void
) => {
  cb(loadLocalePool);
};
/**
 * 生成Message
 * @param langs
 * @param prefix
 * @returns
 */
export const genMessage = (
  langs: { [key: string]: { [key: string]: any } },
  prefix = 'lang'
) => {
  const obj: Recordable<any> = {};
  Object.keys(langs).forEach((key) => {
    const langFileModule = langs[key].default;
    let fileName = key.replace(`./${prefix}/`, '').replace(/^\.\//, '');
    const lastIndex = fileName.lastIndexOf('.');
    fileName = fileName.substring(0, lastIndex);
    const keyList = fileName.split('/');
    const moduleName = keyList.shift();
    const objKey = keyList.join('.');
    if (moduleName) {
      if (objKey) {
        set(obj, moduleName, obj[moduleName] || {});
        set(obj[moduleName], objKey, langFileModule);
      } else {
        set(obj, moduleName, langFileModule || {});
      }
    }
  });
  return obj;
};
