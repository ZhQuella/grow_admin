import type { DefineAppConfigOptions, ProjectSetting } from '@grow-admin-rock/types'
import {
  ThemeModeEnum,
} from '@grow-admin-rock/constants'
import { createStorageName } from '@grow-admin-rock/utils'
import { useAppConfig } from '@grow-admin-rock/state'
import { projectSetting } from './projectSetting'

export function mapProjectSettingToAppConfig(
  setting: ProjectSetting,
): Partial<DefineAppConfigOptions> {
  return {
    themeMode: ThemeModeEnum.SYSTEM,
    themeColor: setting.themeColor,
    showThemeModeToggle: setting.showDarkModeToggle,
    showSettingButton: setting.showSettingButton,
    showSettingDrawer: setting.showSettingDrawer,
    useOpenBackTop: setting.useOpenBackTop,
    canEmbedIFramePage: setting.canEmbedIFramePage,
    closeMessageOnSwitch: setting.closeMessageOnSwitch,
    removeAllHttpPending: setting.removeAllHttpPending,
    permissionCacheType: setting.permissionCacheType,
    settingButtonPosition: setting.settingButtonPosition,
    permissionMode: setting.permissionMode,
    sessionTimeoutProcessing: setting.sessionTimeoutProcessing,
    lockTime: setting.lockTime,
    useLockPage: setting.useLockPage,
    transition: {
      enable: setting.transitionSetting.enable,
      basicTransition: setting.transitionSetting.basicTransition,
    },
  }
}

export function bootstrapAppConfig() {
  const storageKey = `${createStorageName(import.meta.env)}__APP_CONFIG`
  const appConfig = useAppConfig()
  const mappedConfig = mapProjectSettingToAppConfig(projectSetting)

  if (!localStorage.getItem(storageKey)) {
    appConfig.$patch(mappedConfig)
    return
  }

  // 非持久化、由 projectSetting 决定的项目级开关，每次启动都需同步
  appConfig.$patch({
    lockTime: mappedConfig.lockTime,
    useLockPage: mappedConfig.useLockPage,
  })
}
