import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ThemeEnum, ThemeModeEnum } from '@grow-admin-rock/constants'
import { useAppConfig } from '../modules/appConfig'
import {
  applyDarkClass,
  applyThemeColor,
  generateThemeColorPalette,
  getSystemIsDark,
  withThemeTransition,
} from './utils'

export function useTheme() {
  const appConfig = useAppConfig()
  const { themeMode, themeColor } = storeToRefs(appConfig)
  const systemIsDark = ref(getSystemIsDark())

  const resolvedTheme = computed(() => {
    if (themeMode.value === ThemeModeEnum.SYSTEM) {
      return systemIsDark.value ? ThemeEnum.DARK : ThemeEnum.LIGHT
    }
    return themeMode.value === ThemeModeEnum.DARK ? ThemeEnum.DARK : ThemeEnum.LIGHT
  })
  const isDark = computed(() => resolvedTheme.value === ThemeEnum.DARK)

  const themePalette = computed(() => generateThemeColorPalette(themeColor.value))

  const naiveThemeOverrides = computed(() => ({
    common: {
      primaryColor: themePalette.value.primary,
      primaryColorHover: themePalette.value.hover,
      primaryColorPressed: themePalette.value.active,
      primaryColorSuppl: themePalette.value.suppl,
    },
  }))

  let isInitialSync = true

  function applyThemeToDom() {
    applyDarkClass(isDark.value)
    applyThemeColor(themeColor.value)
  }

  function syncThemeToDom() {
    if (isInitialSync) {
      isInitialSync = false
      applyThemeToDom()
      return
    }
    withThemeTransition(applyThemeToDom)
  }

  watch([themeMode, themeColor, systemIsDark], syncThemeToDom, { immediate: true })

  let media: MediaQueryList | undefined
  let onSystemChange: ((event: MediaQueryListEvent) => void) | undefined

  onMounted(() => {
    media = window.matchMedia('(prefers-color-scheme: dark)')
    systemIsDark.value = media.matches
    onSystemChange = (event) => {
      systemIsDark.value = event.matches
    }
    media.addEventListener('change', onSystemChange)
  })

  onUnmounted(() => {
    if (media && onSystemChange) {
      media.removeEventListener('change', onSystemChange)
    }
  })

  return {
    themeMode,
    themeColor,
    resolvedTheme,
    isDark,
    themePalette,
    naiveThemeOverrides,
    setThemeMode: appConfig.setThemeMode,
    setThemeColor: appConfig.setThemeColor,
    syncThemeToDom,
  }
}
