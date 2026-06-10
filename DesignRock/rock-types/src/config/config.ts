import {
  CacheTypeEnum,
  PermissionModeEnum,
  SessionTimeoutProcessingEnum,
  SettingButtonPositionEnum,
  ThemeModeEnum,
  RouterTransitionEnum,
  AuthorizationModeEnum,
} from '@grow-admin-rock/constants'
import type { Ref } from 'vue-demi'

export type LocaleType = 'zh_CN' | 'en' | 'ru' | 'ja' | 'ko'

export interface LocaleConfig {
  // Current language
  locale: LocaleType
  // default language
  fallback: LocaleType
  // available Locales
  availableLocales: LocaleType[]
}

export interface StaticConfig {
  /**
   * Permission Type:
   * frontend: indicates that permissions are controlled by the front end
   * backend: indicates that the permissions are controlled by the backend
   */
  authType: 'frontend' | 'backend'

  // Display a progress bar at the top when switching pages
  enableProgress: boolean
}

export interface DynamicConfig {
  __: string
}
/**
 * @description: 代码层配置的类型
 */
export interface GlobConfig {
  // Site title
  title: string
  // Service interface url
  apiUrl: string
  // Project abbreviation
  shortName: string
  // Authorization mode
  authMode: AuthorizationModeEnum,
  // OAuth2 Automatic login
  oauthAutoLogin: boolean
  // OAuth2 Code login host
  oauthCodeServer?: string
  // OAuth2 Code login route
  oauthCodeRoute?: string
}

/**
 * @description: 环境变量配置
 */
export interface GlobEnvConfig {
  // Site title
  VITE_GLOB_APP_TITLE: string
  // Service interface url
  VITE_GLOB_API_URL: string
  // Project abbreviation
  VITE_GLOB_APP_SHORT_NAME: string
  // Authorization mode
  VITE_GLOB_APP_AUTH_MODE: string
  // OAuth2 Automatic login
  VITE_GLOB_APP_IS_AUTO_OAUTH?: boolean
  // OAuth2 Code login route
  VITE_GLOB_APP_OAUTH_CODE_ROUTE?: string
  // OAuth2 Code login host
  VITE_GLOB_APP_OAUTH_CODE_SERVER?: string
  // 其他配置
  [key: string]: any
}

export interface DefineAppConfigOptions {
  // Global theme mode (light / dark / system)
  themeMode: ThemeModeEnum
  // Theme color
  themeColor: string
  // Whether to show the theme switch button
  showThemeModeToggle: boolean
  // Whether to show the project config button
  showSettingButton: boolean
  // Whether to enable the project config drawer
  showSettingDrawer: boolean
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
  // Configure where the button is displayed
  settingButtonPosition: SettingButtonPositionEnum
  // Permission mode
  permissionMode: PermissionModeEnum
  // Session timeout processing
  sessionTimeoutProcessing: SessionTimeoutProcessingEnum
  // Lock screen time
  lockTime: number
  // Whether to show the lock screen
  useLockPage: boolean
  transition: TransitionConfigOptions
}

export interface TransitionConfigOptions {
  //  Whether to open the page switching animation
  enable: boolean
  // Route basic switching animation
  basicTransition: RouterTransitionEnum
}

export interface FooterLinkOptions {
  label?: Ref<string>
  icon?: string
  target?: '_self' | '_blank'
  url: string
}

export interface DefineSiteOptions {
  // Logo url
  logo: string
  // Avatar url
  avatar: string
  // username
  username: string,
  // Site title
  title: string
  // Copyright Information
  copyright: Ref<string>
  // Footer link
  links: FooterLinkOptions[]
  // 站点配置
  site: GlobConfig,
  // 环境变量
  env: GlobEnvConfig
}
