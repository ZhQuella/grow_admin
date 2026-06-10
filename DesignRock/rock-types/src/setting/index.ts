import {
  CacheTypeEnum,
  ContentLayoutEnum,
  MenuModeEnum,
  MenuTypeEnum,
  MixSidebarTriggerEnum,
  PermissionModeEnum,
  SessionTimeoutProcessingEnum,
  SettingButtonPositionEnum,
  ThemeEnum,
  TriggerEnum,
  RouterTransitionEnum,
} from '@grow-admin-rock/constants'
import { LocaleType } from '#/config'
import type { ComponentLibrarySetting } from './componentLibrary'

/**
 * @description:  菜单设置
 */
export interface MenuSetting {
  bgColor: string
  fixed: boolean
  collapsed: boolean
  canDrag: boolean
  show: boolean
  hidden: boolean
  split: boolean
  menuWidth: number
  mode: MenuModeEnum
  type: MenuTypeEnum
  theme: ThemeEnum
  topMenuAlign: 'start' | 'center' | 'end'
  trigger: TriggerEnum
  accordion: boolean
  closeMixSidebarOnChange: boolean
  collapsedShowTitle: boolean
  mixSideTrigger: MixSidebarTriggerEnum
  mixSideFixed: boolean
  readonly width?: number
  readonly mixSidebarWidth?: number
  readonly collapsedWidth?: number
}

/**
 * @description: 多Tab设置
 */
export interface MultiTabsSetting {
  cache: boolean
  // Turn on
  show: boolean
  hidden: boolean
  // Turn on quick actions
  showQuick: boolean
  canDrag: boolean
  // Whether to show the refresh button
  showRedo: boolean
  // Whether to show the collapse button
  showFold: boolean
  readonly height?: number
}

/**
 * @description: Header设置
 */
export interface HeaderSetting {
  color: string
  bgColor: string
  fixed: boolean
  show: boolean
  // 是否隐藏Header
  hidden: boolean
  theme: ThemeEnum
  // Turn on full screen
  showFullScreen: boolean
  // Whether to show the lock screen
  useLockPage: boolean
  // Show document button
  showDoc: boolean
  // Show message center button
  showNotice: boolean
  showSearch: boolean
  showLocalePicker: boolean
  readonly height?: number
}

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
  // Whether to open page switching loading
  openPageLoading: boolean
  // Whether to open the top progress bar
  openNProgress: boolean
}

/**
 * @description: 工程中其他设置
 */
export interface SporadicSetting {
  // Whether to open the top progress bar
  openNProgress: boolean
  // pageLayout whether to enable keep-alive
  openKeepAlive: boolean
  // Lock screen time
  lockTime: number
  // Show breadcrumbs
  showBreadCrumb: boolean
  // Show breadcrumb icon
  showBreadCrumbIcon: boolean
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
  // Website gray mode, open for possible mourning dates
  grayMode: boolean
  // Whether to turn on the color weak mode
  colorWeak: boolean
  // Theme color
  themeColor: string

  // The main interface is displayed in full screen, the menu is not displayed, and the top
  fullContent: boolean
  // content width
  contentMode: ContentLayoutEnum
  // Whether to display the logo
  showLogo: boolean
  // Whether to show the global footer
  showFooter: boolean
  hiddenFooter: boolean
  readonly footerHeight?: number
}

export type ProjectConfig = ProjectSetting

/**
 * @description:  Setting interface parameters
 */
export interface ProjectSetting extends SporadicSetting, ComponentLibrarySetting {
  // menuType: MenuTypeEnum;
  headerSetting: HeaderSetting
  // menuSetting
  menuSetting: MenuSetting
  // Multi-tab settings
  multiTabsSetting: MultiTabsSetting
  // Animation configuration
  transitionSetting: TransitionSetting
}

export * from './componentLibrary'

export * from './store'
