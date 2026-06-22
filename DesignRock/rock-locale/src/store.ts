import type { LocaleType } from '@grow-admin-rock/types'
import { computed } from 'vue'
import { LOCALE_KEY } from '@grow-admin-rock/constants'
import { createStorageName, useLocalStorage } from '@grow-admin-rock/utils'
import { LOCALE, localeSetting } from './config'

export function createLocaleStorageKey(env: Record<string, any> = import.meta.env) {
  return `${createStorageName(env)}${LOCALE_KEY}`
}

const store = useLocalStorage(createLocaleStorageKey(), localeSetting, { mergeDefaults: true })

function resolveLocale(locale?: LocaleType): LocaleType {
  if (locale && localeSetting.availableLocales.includes(locale)) {
    return locale
  }
  return LOCALE.zh
}

const persistedLocale = resolveLocale(store.value?.locale)
if (persistedLocale !== store.value?.locale) {
  store.value = { ...localeSetting, ...store.value, locale: LOCALE.zh }
}

export function setLocale(locale: LocaleType) {
  store.value = { ...store.value, locale: resolveLocale(locale) }
}

export const getLocale = computed(() => resolveLocale(store.value?.locale))
