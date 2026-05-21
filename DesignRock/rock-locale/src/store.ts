import type { LocaleType } from '@grow-admin-rock/types'
import { computed } from 'vue'
import { LOCALE_KEY } from '@grow-admin-rock/constants'
import { useLocalStorage } from '@grow-admin-rock/utils'
import { localeSetting } from './config'

const store = useLocalStorage(LOCALE_KEY, localeSetting)

export function setLocale(locale: LocaleType) {
  store.value.locale = locale
}

export const getLocale = computed(() => store.value.locale)
