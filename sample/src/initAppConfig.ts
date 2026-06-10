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
    openKeepAlive: setting.openKeepAlive,
    useOpenBackTop: setting.useOpenBackTop,
    canEmbedIFramePage: setting.canEmbedIFramePage,
    closeMessageOnSwitch: setting.closeMessageOnSwitch,
    removeAllHttpPending: setting.removeAllHttpPending,
    permissionCacheType: setting.permissionCacheType,
    settingButtonPosition: setting.settingButtonPosition,
    permissionMode: setting.permissionMode,
    sessionTimeoutProcessing: setting.sessionTimeoutProcessing,
    grayMode: setting.grayMode,
    colorWeak: setting.colorWeak,
    lockTime: setting.lockTime,
    useLockPage: setting.headerSetting.useLockPage,
    closeMixSidebarOnChange: setting.menuSetting.closeMixSidebarOnChange,
    navBarMode: setting.menuSetting.type,
    header: {
      theme: setting.headerSetting.theme,
      show: setting.headerSetting.show,
      visible: !setting.headerSetting.hidden,
      bgColor: setting.headerSetting.bgColor,
      fixed: setting.headerSetting.fixed,
      showFullScreen: setting.headerSetting.showFullScreen,
      showDoc: setting.headerSetting.showDoc,
      showNotice: setting.headerSetting.showNotice,
      showSearch: setting.headerSetting.showSearch,
      showLocalePicker: setting.headerSetting.showLocalePicker,
      showSetting: setting.showSettingButton,
      showBreadCrumb: setting.showBreadCrumb,
      showBreadCrumbIcon: setting.showBreadCrumbIcon,
      height: 48,
    },
    sidebar: {
      theme: setting.menuSetting.theme,
      show: setting.menuSetting.show,
      visible: !setting.menuSetting.hidden,
      bgColor: setting.menuSetting.bgColor,
      fixed: setting.menuSetting.fixed,
      width: setting.menuSetting.menuWidth,
      collapsed: setting.menuSetting.collapsed,
      trigger: setting.menuSetting.trigger,
      mixSidebarWidth: 80,
      collapsedWidth: 48,
    },
    menu: {
      canDrag: setting.menuSetting.canDrag,
      split: setting.menuSetting.split,
      mode: setting.menuSetting.mode,
      accordion: setting.menuSetting.accordion,
      collapsedShowTitle: setting.menuSetting.collapsedShowTitle,
      mixSideTrigger: setting.menuSetting.mixSideTrigger,
      mixSideFixed: setting.menuSetting.mixSideFixed,
      topMenuAlign: setting.menuSetting.topMenuAlign,
      subMenuWidth: 0,
      dropdownPlacement: 'bottom-start',
    },
    logo: {
      show: setting.showLogo,
      visible: true,
      showTitle: true,
    },
    tabTar: {
      show: setting.multiTabsSetting.show,
      visible: !setting.multiTabsSetting.hidden,
      cache: setting.multiTabsSetting.cache,
      canDrag: setting.multiTabsSetting.canDrag,
      showQuick: setting.multiTabsSetting.showQuick,
      showRedo: setting.multiTabsSetting.showRedo,
      showFold: setting.multiTabsSetting.showFold,
      height: 36,
    },
    content: {
      fullScreen: setting.fullContent,
      mode: setting.contentMode,
    },
    footer: {
      show: setting.showFooter,
      visible: !setting.hiddenFooter,
      height: 60,
    },
    transition: {
      enable: setting.transitionSetting.enable,
      basicTransition: setting.transitionSetting.basicTransition,
      openPageLoading: setting.transitionSetting.openPageLoading,
      openNProgress: setting.transitionSetting.openNProgress,
    },
  }
}

export function bootstrapAppConfig() {
  const storageKey = `${createStorageName(import.meta.env)}__APP_CONFIG`
  if (localStorage.getItem(storageKey)) return
  useAppConfig().$patch(mapProjectSettingToAppConfig(projectSetting))
}
