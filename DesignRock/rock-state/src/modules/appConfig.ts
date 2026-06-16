import { defineStore } from 'pinia'
import {
  DefineAppConfigOptions,
  TransitionConfigOptions,
} from '@grow-admin-rock/types'
import { _assign } from '@grow-admin-rock/utils'
import {
  CacheTypeEnum,
  PermissionModeEnum,
  RouterTransitionEnum,
  SessionTimeoutProcessingEnum,
  SettingButtonPositionEnum,
  ThemeModeEnum,
  SystemLayoutEnum,
  SystemLayoutType,
} from '@grow-admin-rock/constants'

export type AppConfigStore = ReturnType<typeof useAppConfig>

// TODO 挪到基础Layout中定义实现依赖注入
export const useAppConfig = defineStore({
  id: 'APP_CONFIG',
  state: (): DefineAppConfigOptions => ({
    themeMode: ThemeModeEnum.SYSTEM,
    themeColor: '#8b5cf6',
    showThemeModeToggle: true,
    showSettingButton: true,
    showSettingDrawer: true,
    useOpenBackTop: true,
    closeMessageOnSwitch: false,
    removeAllHttpPending: true,
    permissionCacheType: CacheTypeEnum.LOCAL,
    settingButtonPosition: SettingButtonPositionEnum.AUTO,
    permissionMode: PermissionModeEnum.ROUTE_MAPPING,
    sessionTimeoutProcessing: SessionTimeoutProcessingEnum.ROUTE_JUMP,
    lockTime: 0,
    useLockPage: false,
    canEmbedIFramePage: true,
    transition: {
      enable: true,
      basicTransition: RouterTransitionEnum.FADE_SIDE,
    },
    layoutType: SystemLayoutEnum.SIDE,
    systemName: 'Grow Admin',
  }),
  actions: {
    setThemeMode(value: ThemeModeEnum) {
      this.themeMode = value
    },
    setThemeColor(value: string) {
      this.themeColor = value
    },
    setShowThemeModeToggle(value: boolean) {
      this.showThemeModeToggle = value
    },
    setUseOpenBackTop(value: boolean) {
      this.useOpenBackTop = value
    },
    setCloseMessageOnSwitch(value: boolean) {
      this.closeMessageOnSwitch = value
    },
    setRemoveAllHttpPending(value: boolean) {
      this.removeAllHttpPending = value
    },
    setPermissionCacheType(value: CacheTypeEnum) {
      this.permissionCacheType = value
    },
    setSettingButtonPosition(value: SettingButtonPositionEnum) {
      this.settingButtonPosition = value
    },
    setPermissionMode(value: PermissionModeEnum) {
      this.permissionMode = value
    },
    setSessionTimeoutProcessing(value: SessionTimeoutProcessingEnum) {
      this.sessionTimeoutProcessing = value
    },
    setLockTime(value: number) {
      this.lockTime = value
    },
    setUseLockPage(value: boolean) {
      this.useLockPage = value
    },
    setCanEmbedIFramePage(value: boolean) {
      this.canEmbedIFramePage = value
    },
    setTransition(value: Partial<TransitionConfigOptions>) {
      _assign(this.transition, value)
    },
    setLayoutType(value: SystemLayoutType) {
      this.layoutType = value
    },
    setSystemName(value: string) {
      this.systemName = value
    },
  },
  persist: {
    paths: [
      'themeMode',
      'themeColor',
      'showThemeModeToggle',
      'showSettingButton',
      'showSettingDrawer',
      'useOpenBackTop',
      'closeMessageOnSwitch',
      'removeAllHttpPending',
      'permissionCacheType',
      'settingButtonPosition',
      'permissionMode',
      'sessionTimeoutProcessing',
      'lockTime',
      'useLockPage',
      'canEmbedIFramePage',
      'transition',
      'layoutType',
      'systemName',
    ],
  },
})
