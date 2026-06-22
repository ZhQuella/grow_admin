import { unref, computed, type Ref } from "vue"
import { diK } from "@grow-admin-rock/ioc"
import { Lib } from "#/../library"

export interface I18nGlobalTranslation {
  (key: string): string
  (key: string, locale: string): string
  (key: string, locale: string, list: unknown[]): string
  (key: string, locale: string, named: Record<string, unknown>): string
  (key: string, list: unknown[]): string
  (key: string, named: Record<string, unknown>): string
}

type I18nTranslationRestParameters = [string, any]

function getKey(namespace: string | undefined, key: string) {
  if (!namespace) {
    return key
  }
  if (key.startsWith(namespace)) {
    return key
  }
  return `${namespace}.${key}`
}

/**
 * 带有T方法的i18n
 */
export type I18nWithTMethod = {
  t: I18nGlobalTranslation
}

/**
 * 直接将i8n转换为ref
 * 方法名不要变，因为vscode插件会识别，如果变了，编辑器中无法直接展示转换后的名
 * @param key 
 * @param namespace 
 * @returns 
 */
export const $t = (key:string, namespace?: string):Ref<string> => {
  return computed(() => useI18n(namespace).t(key))
}

export const useI18n = (namespace?: string): I18nWithTMethod => {
  const normalFn = {
    t: (key: string) => {
      return getKey(namespace, key)
    },
  }
  const i18n = diK(Lib.types.I18n)
  if (!i18n) {
    return normalFn
  }
  const { t, ...methods } = i18n.global
  const tFn: I18nGlobalTranslation = (key: string | Ref<string>, ...arg: any[]) => {
    const _key = unref(key)
    if (!_key) return ''
    if (!_key.includes('.') && !namespace) return key
    // @ts-ignore
    return t(getKey(namespace, key), ...(arg as I18nTranslationRestParameters))
  }
  return {
    ...methods,
    t: tFn,
  }
}

// Why write this function？
// Mainly to configure the vscode i18nn ally plugin. This function is only used for routing and menus. Please use useI18n for other places

// 为什么要编写此函数？
// 主要用于配合vscode i18nn ally插件。此功能仅用于路由和菜单。请在其他地方使用useI18n
export const t = (key: string) => key
