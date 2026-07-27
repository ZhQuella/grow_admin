import { ThemeEnum, ThemeModeEnum } from '@grow-admin-rock/constants'

export interface ThemeColorPalette {
  primary: string
  hover: string
  active: string
  suppl: string
  light3: string
  light5: string
  light7: string
  light8: string
  light9: string
  dark2: string
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function parseHex(hex: string) {
  const normalized = hex.replace('#', '')
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized.slice(0, 6)
  const int = Number.parseInt(value, 16)
  if (Number.isNaN(int)) {
    return { r: 139, g: 92, b: 246 }
  }
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  }
}

function rgbToHex(r: number, g: number, b: number) {
  const toHex = (channel: number) => channel.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/** 与 Element Plus 一致的混色算法 */
export function mixColor(color: string, mixHex: string, weight: number) {
  const base = parseHex(color)
  const mix = parseHex(mixHex)
  const ratio = clamp(weight, 0, 1)
  return rgbToHex(
    Math.round(base.r * (1 - ratio) + mix.r * ratio),
    Math.round(base.g * (1 - ratio) + mix.g * ratio),
    Math.round(base.b * (1 - ratio) + mix.b * ratio),
  )
}

export function getLightColor(color: string, level: number) {
  return mixColor(color, '#ffffff', level / 10)
}

export function getDarkColor(color: string, level: number) {
  return mixColor(color, '#000000', level / 10)
}

/** Element Plus 暗色模式混色底色（与 theme-chalk/dark 中 --el-bg-color 一致） */
const EL_DARK_BG = '#141414'

/**
 * 生成主题色阶。
 * isDark 时按 Element Plus 暗色算法：light-* 与背景色混色，dark-2 与白色混色。
 */
export function generateThemeColorPalette(color: string, isDark = false): ThemeColorPalette {
  const primary = color.startsWith('#') ? color : `#${color}`
  if (isDark) {
    return {
      primary,
      hover: mixColor(primary, '#ffffff', 0.2),
      active: mixColor(primary, EL_DARK_BG, 0.2),
      suppl: mixColor(primary, EL_DARK_BG, 0.5),
      light3: mixColor(primary, EL_DARK_BG, 0.3),
      light5: mixColor(primary, EL_DARK_BG, 0.5),
      light7: mixColor(primary, EL_DARK_BG, 0.7),
      light8: mixColor(primary, EL_DARK_BG, 0.8),
      light9: mixColor(primary, EL_DARK_BG, 0.9),
      dark2: mixColor(primary, '#ffffff', 0.2),
    }
  }
  return {
    primary,
    hover: getLightColor(primary, 2),
    active: getDarkColor(primary, 2),
    suppl: getLightColor(primary, 5),
    light3: getLightColor(primary, 3),
    light5: getLightColor(primary, 5),
    light7: getLightColor(primary, 7),
    light8: getLightColor(primary, 8),
    light9: getLightColor(primary, 9),
    dark2: getDarkColor(primary, 2),
  }
}

export function getSystemIsDark(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function resolveThemeMode(mode: ThemeModeEnum): ThemeEnum {
  if (mode === ThemeModeEnum.SYSTEM) {
    return getSystemIsDark() ? ThemeEnum.DARK : ThemeEnum.LIGHT
  }
  return mode === ThemeModeEnum.DARK ? ThemeEnum.DARK : ThemeEnum.LIGHT
}

export function hexToRgbChannels(hex: string): string {
  const { r, g, b } = parseHex(hex)
  return `${r}, ${g}, ${b}`
}

export function applyThemeColor(
  color: string,
  el: HTMLElement = document.documentElement,
  isDark = false,
) {
  if (!color) return
  // 应用层 token 始终用浅色混色，避免暗色算法影响业务变量语义
  const appPalette = generateThemeColorPalette(color)
  // Element Plus light-* / dark-2 需跟随暗色算法，否则菜单 hover 等会变成近白色
  const elPalette = generateThemeColorPalette(color, isDark)

  el.style.setProperty('--primary-color', appPalette.primary)
  el.style.setProperty('--primary-color-hover', appPalette.hover)
  el.style.setProperty('--primary-color-active', appPalette.active)
  el.style.setProperty('--primary-color-suppl', appPalette.suppl)
  el.style.setProperty('--primary-color-rgb', hexToRgbChannels(appPalette.primary))

  el.style.setProperty('--el-color-primary', elPalette.primary)
  el.style.setProperty('--el-color-primary-light-3', elPalette.light3)
  el.style.setProperty('--el-color-primary-light-5', elPalette.light5)
  el.style.setProperty('--el-color-primary-light-7', elPalette.light7)
  el.style.setProperty('--el-color-primary-light-8', elPalette.light8)
  el.style.setProperty('--el-color-primary-light-9', elPalette.light9)
  el.style.setProperty('--el-color-primary-dark-2', elPalette.dark2)
}

export function applyDarkClass(isDark: boolean, el: HTMLElement = document.documentElement) {
  el.classList.toggle('dark', isDark)
}

export const THEME_TRANSITION_CLASS = 'theme-transition'

const THEME_TRANSITION_MS = 350

let themeTransitionTimer: ReturnType<typeof setTimeout> | undefined

/** 在主题变更时短暂启用全局颜色过渡 */
export function withThemeTransition(run: () => void) {
  if (typeof document === 'undefined') {
    run()
    return
  }

  const root = document.documentElement
  root.classList.add(THEME_TRANSITION_CLASS)

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      run()
    })
  })

  if (themeTransitionTimer) {
    clearTimeout(themeTransitionTimer)
  }

  themeTransitionTimer = window.setTimeout(() => {
    root.classList.remove(THEME_TRANSITION_CLASS)
    themeTransitionTimer = undefined
  }, THEME_TRANSITION_MS)
}
