import { computed, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ThemeEnum, ThemeModeEnum } from '@grow-admin-rock/constants'
import { useAppConfig } from '../modules/appConfig'
import {
  applyBodyFilters,
  applyDarkClass,
  applyThemeColor,
  generateThemeColorPalette,
  resolveThemeMode,
  withThemeTransition,
} from './utils'

export function useTheme() {
  const appConfig = useAppConfig()
  const { themeMode, themeColor, grayMode, colorWeak } = storeToRefs(appConfig)

  const resolvedTheme = computed(() => resolveThemeMode(themeMode.value))
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
    applyBodyFilters({
      grayMode: grayMode.value,
      colorWeak: colorWeak.value,
    })
  }

  function syncThemeToDom() {
    if (isInitialSync) {
      isInitialSync = false
      applyThemeToDom()
      return
    }
    withThemeTransition(applyThemeToDom)
  }

  watch([themeMode, themeColor, grayMode, colorWeak], syncThemeToDom, { immediate: true })

  let media: MediaQueryList | undefined
  let onSystemChange: (() => void) | undefined

  onMounted(() => {
    media = window.matchMedia('(prefers-color-scheme: dark)')
    onSystemChange = () => {
      if (themeMode.value === ThemeModeEnum.SYSTEM) {
        syncThemeToDom()
      }
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
