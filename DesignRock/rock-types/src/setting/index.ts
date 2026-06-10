import {
  CacheTypeEnum,
  PermissionModeEnum,
  SessionTimeoutProcessingEnum,
  SettingButtonPositionEnum,
  RouterTransitionEnum,
} from '@grow-admin-rock/constants'
import { LocaleType } from '#/config'
import type { ComponentLibrarySetting } from './componentLibrary'

/**
 * @description: 本地化设置
 */
export interface LocaleSetting {
  showPicker: boolean
  // Current language
  locale: LocaleType
  // default language
  fallback: LocaleType
  // available Locales
  availableLocales: LocaleType[]
}

/**
 * @description: 动画设置
 */
export interface TransitionSetting {
  //  Whether to open the page switching animation
  enable: boolean
  // Route basic switching animation
  basicTransition: RouterTransitionEnum
}

/**
 * @description: 工程中其他设置
 */
export interface SporadicSetting {
  // Lock screen time
  lockTime: number
  // Whether to show the lock screen
  useLockPage: boolean
  // Whether to open back to top
  useOpenBackTop: boolean
  // Is it possible to embed iframe pages
  canEmbedIFramePage: boolean
  // Whether to delete unclosed messages and notify when switching the interface
  closeMessageOnSwitch: boolean
  // Whether to cancel the http request that has been sent but not responded when switching the interface.
  removeAllHttpPending: boolean
  // Storage location of permission related information
  permissionCacheType: CacheTypeEnum
  // Whether to show the configuration button
  showSettingButton: boolean
  // Whether to show the theme switch button
  showDarkModeToggle: boolean
  // Configure where the button is displayed
  settingButtonPosition: SettingButtonPositionEnum
  // Configure where the Setting Drawer is displayed
  showSettingDrawer: boolean
  // Permission mode
  permissionMode: PermissionModeEnum
  // Session timeout processing
  sessionTimeoutProcessing: SessionTimeoutProcessingEnum
  // Theme color
  themeColor: string
}

export type ProjectConfig = ProjectSetting

/**
 * @description:  Setting interface parameters
 */
export interface ProjectSetting extends SporadicSetting, ComponentLibrarySetting {
  // Animation configuration
  transitionSetting: TransitionSetting
}

export * from './componentLibrary'

export * from './store'
