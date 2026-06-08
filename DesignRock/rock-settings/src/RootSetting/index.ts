import type { ProjectSetting, Setting } from '@grow-admin-rock/types';
import type { App } from '@grow-admin-rock/state';
import type { RoutesTable } from '@grow-admin-rock/middleware-router';
import types from '#/../beankeys';
import { Bean, Autowired } from '@grow-admin-rock/ioc';
import { Lib as stateLib } from '@grow-admin-rock/state';
import { Ref, computed, unref } from 'vue';
import {ContentLayoutEnum, PermissionModeEnum, SettingButtonPositionEnum, ThemeEnum} from '@grow-admin-rock/constants';
import { Lib as routeLib } from '@grow-admin-rock/middleware-router';
@Bean()
export class RootSetting {
  settingStore: Setting.SettingStore;
  appStore: App.AppStore;
  routeTable: RoutesTable;

  getSettingButtonPosition: Ref<SettingButtonPositionEnum>;
  getFullContent: Ref<boolean>;
  getColorWeak: Ref<boolean>;
  getGrayMode: Ref<boolean>;
  getContentMode: Ref<ContentLayoutEnum>;
  getLayoutContentMode:Ref<ContentLayoutEnum>
  getPageLoading: Ref<boolean>;
  getOpenKeepAlive: Ref<boolean>;
  getCanEmbedIFramePage: Ref<boolean>;
  getPermissionMode: Ref<PermissionModeEnum>;
  getShowLogo: Ref<boolean>;
  getShowBreadCrumb: Ref<boolean>;
  getShowBreadCrumbIcon: Ref<boolean>;
  getUseOpenBackTop: Ref<boolean>;
  getShowSettingButton: Ref<boolean>;
  getShowFooter: Ref<boolean>;
  getLockTime: Ref<number>;
  getThemeColor: Ref<string>;
  getShowDarkModeToggle: Ref<boolean>;
  getDarkMode: Ref<ThemeEnum>;

  constructor(
    @Autowired(types.SettingStore) settingStore: Setting.SettingStore,
    @Autowired(stateLib.types.AppStore) appStore: App.AppStore,
    @Autowired(routeLib.types.RouteTable) routeTable: RoutesTable
  ) {
    this.settingStore = settingStore;
    this.appStore = appStore;
    this.routeTable = routeTable;

    const getDarkMode = computed(() => settingStore.getDarkMode);
    const getSettingButtonPosition = computed(() => settingStore.getProjectConfig.settingButtonPosition);
    const getFullContent = computed(() => {
      const { currentRoute } = routeTable.router;
      const route = unref(currentRoute);
      const query = route.query;
      if (query && Reflect.has(query, '__full__')) {
        return true;
      }
      // Return to the configuration in the configuration file
      return settingStore.getProjectConfig.fullContent;
    })
    const getColorWeak = computed(() => settingStore.getProjectConfig.colorWeak);
    const getGrayMode = computed(() => settingStore.getProjectConfig.grayMode);
    const getOpenKeepAlive = computed(() => settingStore.getProjectConfig.openKeepAlive);
    const getCanEmbedIFramePage = computed(() => settingStore.getProjectConfig.canEmbedIFramePage);
    const getPermissionMode = computed(() => settingStore.getProjectConfig.permissionMode);
    const getShowLogo = computed(() => settingStore.getProjectConfig.showLogo);
    const getShowBreadCrumb = computed(() => settingStore.getProjectConfig.showBreadCrumb);
    const getShowBreadCrumbIcon = computed(() => settingStore.getProjectConfig.showBreadCrumbIcon);
    const getUseOpenBackTop = computed(() => settingStore.getProjectConfig.useOpenBackTop);
    const getShowSettingButton = computed(() => settingStore.getProjectConfig.showSettingButton);
    const getShowFooter = computed(() => settingStore.getProjectConfig.showFooter);
    const getLockTime = computed(() => settingStore.getProjectConfig.lockTime);
    const getThemeColor = computed(() => settingStore.getProjectConfig.themeColor);
    const getShowDarkModeToggle = computed(() => settingStore.getProjectConfig.showDarkModeToggle)
    const getContentMode = computed(() => settingStore.getProjectConfig.contentMode);
    const getLayoutContentMode = computed(() =>
      unref(getContentMode) === ContentLayoutEnum.FULL
        ? ContentLayoutEnum.FULL
        : ContentLayoutEnum.FIXED
    );
    const getPageLoading = computed(() => appStore.getPageLoading)

    this.getSettingButtonPosition = getSettingButtonPosition;
    this.getFullContent = getFullContent;
    this.getColorWeak = getColorWeak;
    this.getGrayMode = getGrayMode;
    this.getContentMode = getContentMode;
    this.getLayoutContentMode = getLayoutContentMode;
    this.getPageLoading = getPageLoading;
    this.getOpenKeepAlive = getOpenKeepAlive;
    this.getCanEmbedIFramePage = getCanEmbedIFramePage;
    this.getPermissionMode = getPermissionMode;
    this.getShowLogo = getShowLogo;
    this.getShowBreadCrumb = getShowBreadCrumb;
    this.getShowBreadCrumbIcon = getShowBreadCrumbIcon;
    this.getUseOpenBackTop = getUseOpenBackTop;
    this.getShowSettingButton = getShowSettingButton;
    this.getShowFooter = getShowFooter;
    this.getLockTime = getLockTime;
    this.getThemeColor = getThemeColor;
    this.getShowDarkModeToggle = getShowDarkModeToggle;
    this.getDarkMode = getDarkMode
  }
  /**
   * 设置主题模式
   * @param mode
   */
  setDarkMode(mode: ThemeEnum) {
    this.settingStore.setDarkMode(mode)
  }

  /**
   * 批量更新Setting
   * @param setting
   */
  setProjectConfig(setting: DeepPartial<ProjectSetting>) {
    this.settingStore.setProjectConfig(setting);
  }
}
