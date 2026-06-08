import { ComputedRef, Ref, computed, ref, unref } from "vue";
import {
  SIDE_BAR_MINI_WIDTH,
  SIDE_BAR_SHOW_TIT_MINI_WIDTH,
  MenuModeEnum,
  MenuTypeEnum,
  TriggerEnum,
  ThemeEnum,
  MixSidebarTriggerEnum,
} from '@grow-admin-rock/constants';
import { Bean, Autowired } from "@grow-admin-rock/ioc";
import type { MenuSetting, ProjectSetting, Setting } from "@grow-admin-rock/types";
import TYPES from "#/../beankeys";
import { RootSetting } from "#/RootSetting";

export type TopMenuAlign = 'start' | 'center' | 'end';
@Bean()
export class MenuSettingData {
  settingStore: Setting.SettingStore;
  rootSetting: RootSetting;
  mixSideHasChildren: Ref<boolean>;
  getCollapsed: ComputedRef<boolean>;
  getMenuFixed: ComputedRef<boolean>;
  // Menu Type MenuTypeEnum
  getMenuType: ComputedRef<MenuTypeEnum>;
  /**
   * @description alias {@link getMenuType}
   */
  isMenuTopType: ComputedRef<boolean>;
  /**
   * @description alias {@link getMenuType}
   */
  isMenuSidebarType: ComputedRef<boolean>;
  /**
   * @description alias {@link getMenuType}
   */
  isMenuMixType: ComputedRef<boolean>;
  /**
   * @description alias {@link getMenuType}
   */
  isMenuMixSidebarType: ComputedRef<boolean>;
  /**
   * @description alias {@link getMenuType}
   */
  isMenuSidebarAndTopRecType: ComputedRef<boolean>;
  // Menu Mode: MenuModeEnum
  getMenuMode: ComputedRef<MenuModeEnum>;
  /**
   * @description alias {@link getMenuMode}
   */
  isMenuVerMode: ComputedRef<boolean>;
  /**
   * @description alias {@link getMenuMode}
   */
  isMenuHorMode: ComputedRef<boolean>;
  /**
   * @description alias {@link getMenuMode}
   */
  isMenuVerRightMode: ComputedRef<boolean>;
  /**
   * @description alias {@link getMenuMode}
   */
  isMenuInlineMode: ComputedRef<boolean>;
  getShowMenu: ComputedRef<boolean>;
  getMenuHidden: ComputedRef<boolean>;
  getMenuWidth: ComputedRef<number>;
  getTrigger: ComputedRef<TriggerEnum>;
  getMenuTheme: ComputedRef<ThemeEnum>;
  getSplit: ComputedRef<boolean>;
  getMenuBgColor: ComputedRef<string>;
  getMixSideTrigger: ComputedRef<MixSidebarTriggerEnum>;
  getCanDrag: ComputedRef<boolean>;
  getAccordion: ComputedRef<boolean>;
  getMixSideFixed: ComputedRef<boolean>;
  getTopMenuAlign: ComputedRef<TopMenuAlign>;
  getCloseMixSidebarOnChange: ComputedRef<boolean>;
  /**
   * @deprecated use {@link isMenuSidebarType}
   */
  getIsSidebarType: ComputedRef<boolean>;
  /**
   * @deprecated use {@link isMenuTopType}
   */
  getIsTopMenu: ComputedRef<boolean>;
  getMenuShowLogo: ComputedRef<any>;
  getCollapsedShowTitle: ComputedRef<boolean>;
  getShowTopMenu: ComputedRef<any>;
  getShowHeaderTrigger: ComputedRef<boolean>;
  getIsHorizontal: ComputedRef<boolean>;
  /**
   * @deprecated use {@link isMenuMixSidebarType}
   */
  getIsMixSidebar: ComputedRef<boolean>;
  getIsMixMode: ComputedRef<boolean>;
  getRealWidth: ComputedRef<any>;
  getMiniWidthNumber: ComputedRef<number>;
  getCalcContentWidth: ComputedRef<string>;
  getShowSidebar: ComputedRef<boolean>;

  // isSidebar: (state) => state.navBarMode === MenuTypeEnum.SIDEBAR,
  // isTopMenu: (state) => state.navBarMode === MenuTypeEnum.TOP_MENU,
  // isMixSidebar: (state) => state.navBarMode === MenuTypeEnum.MIX_SIDEBAR,
  // isMix: (state) => state.navBarMode === MenuTypeEnum.MIX,
  // isMixMode: (state) =>
  //   state.menu.mode === MenuModeEnum.INLINE &&
  //   state.navBarMode === MenuTypeEnum.MIX,
  // isHorizontal: (state) => state.menu.mode === MenuModeEnum.HORIZONTAL,

  /**
   * 修改MenuSetting
   * @param menuSetting
   */
  setMenuSetting: (menuSetting: Partial<MenuSetting>) => void;
  /**
   * 折叠菜单
   */
  toggleCollapsed: () => void 

  constructor(
    @Autowired(TYPES.SettingStore) settingStore: Setting.SettingStore,
    @Autowired(TYPES.RootSetting) rootSetting: RootSetting
  ) {
    this.settingStore = settingStore;
    this.rootSetting = rootSetting;
    const mixSideHasChildren = ref(false)
    const menuSettingStore:MenuSetting = settingStore.getMenuSetting || {};
    const getCollapsed = computed(() => menuSettingStore.collapsed);
    // Menu Type MenuTypeEnum
    const getMenuType = computed(() => menuSettingStore.type);
    const isMenuTopType = computed(() => unref(getMenuType) === MenuTypeEnum.TOP_MENU);
    const isMenuSidebarType = computed(() => unref(getMenuType) === MenuTypeEnum.SIDEBAR);
    const isMenuMixType = computed(() => unref(getMenuType) === MenuTypeEnum.MIX);
    const isMenuMixSidebarType = computed(() => unref(getMenuType) === MenuTypeEnum.MIX_SIDEBAR);
    const isMenuSidebarAndTopRecType = computed(() => unref(getMenuType) === MenuTypeEnum.SIDER_WITH_TOP_RECOMMEND);
    // Menu Mode: MenuModeEnum
    const getMenuMode = computed(() => menuSettingStore.mode);
    const isMenuVerMode = computed(() => unref(getMenuMode) === MenuModeEnum.VERTICAL);
    const isMenuHorMode = computed(() => unref(getMenuMode) === MenuModeEnum.HORIZONTAL);
    const isMenuVerRightMode = computed(() => unref(getMenuMode) === MenuModeEnum.VERTICAL_RIGHT);
    const isMenuInlineMode = computed(() => unref(getMenuMode) === MenuModeEnum.INLINE);
    const getMenuFixed = computed(() => menuSettingStore.fixed);
    const getShowMenu = computed(() => menuSettingStore.show);
    const getMenuHidden = computed(() => menuSettingStore.hidden);
    const getMenuWidth = computed(() => menuSettingStore.menuWidth);
    const getTrigger = computed(() => menuSettingStore.trigger);
    const getMenuTheme = computed(() => menuSettingStore.theme);
    const getSplit = computed(() => menuSettingStore?.split);
    const getMenuBgColor = computed(() => menuSettingStore.bgColor);
    const getMixSideTrigger = computed(() => menuSettingStore.mixSideTrigger);
    const getCanDrag = computed(() => menuSettingStore.canDrag);
    const getAccordion = computed(() => menuSettingStore.accordion);
    const getMixSideFixed = computed(() => menuSettingStore.mixSideFixed);
    const getTopMenuAlign = computed(() => menuSettingStore.topMenuAlign);
    const getCloseMixSidebarOnChange = computed(() => menuSettingStore.closeMixSidebarOnChange);
    const getMenuShowLogo = computed(() => unref(rootSetting.getShowLogo) && unref(isMenuSidebarType));
    const getCollapsedShowTitle = computed(() => menuSettingStore.collapsedShowTitle);
    const getShowTopMenu = computed(() => unref(getMenuMode) === MenuModeEnum.HORIZONTAL || unref(getSplit));
    const getShowHeaderTrigger = computed(() => {
      if (
        unref(getMenuType) === MenuTypeEnum.TOP_MENU ||
        !unref(getShowMenu) ||
        unref(getMenuHidden)
      ) {
        return false;
      }
      return unref(getTrigger) === TriggerEnum.HEADER;
    });
    const getIsHorizontal = computed(() => unref(getMenuMode) === MenuModeEnum.HORIZONTAL);
    const getIsMixMode = computed(() => unref(getMenuMode) === MenuModeEnum.INLINE && unref(getMenuType) === MenuTypeEnum.MIX);
    const getRealWidth = computed(() => {
      const isMixSidebar = unref(isMenuMixSidebarType);
      const isCollapsed = unref(getCollapsed);
      const isMixSideFixed = unref(getMixSideFixed);
      const miniWidthNumber = unref(getMiniWidthNumber);
      const menuWidth = unref(getMenuWidth);
      if (isCollapsed && (!isMixSidebar || (isMixSidebar && !isMixSideFixed))) {
        return miniWidthNumber;
      }
      return menuWidth;
    })
    const getMiniWidthNumber = computed(() => {
      const { collapsedShowTitle } = menuSettingStore;
      return collapsedShowTitle ? SIDE_BAR_SHOW_TIT_MINI_WIDTH : SIDE_BAR_MINI_WIDTH;
    });
    const getCalcContentWidth = computed(() => {
      const isTopMenu = unref(isMenuTopType);
      const showMenu = unref(getShowMenu);
      const split = unref(getSplit);
      const menuHidden = unref(getMenuHidden);
      const isMixSidebar = unref(isMenuMixSidebarType);
      const collapsed = unref(getCollapsed);
      const mixSideFixed = unref(getMixSideFixed);
      const realWidth = unref(getRealWidth);
      const sidebarWidth = isMixSidebar
        ? (collapsed ? SIDE_BAR_MINI_WIDTH : SIDE_BAR_SHOW_TIT_MINI_WIDTH) +
          (mixSideFixed && mixSideHasChildren ? realWidth : 0)
        : realWidth;
      const width = isTopMenu || !showMenu || (split && menuHidden) ? 0 : sidebarWidth;
      return `calc(100% - ${width}px)`;
    });
    const getShowSidebar = computed(() => {
      return (
        unref(getSplit) || (
          unref(getShowMenu) 
          && unref(getMenuMode) !== MenuModeEnum.HORIZONTAL 
          && !unref(rootSetting.getFullContent)
        )
      );
    });
    const setMenuSetting = (menuSetting: Partial<MenuSetting>) =>  {
      settingStore.setProjectConfig({ menuSetting });
    }
    const toggleCollapsed = () => this.setMenuSetting({
      collapsed: !unref(getCollapsed)
    })
    this.mixSideHasChildren = mixSideHasChildren
    this.getCollapsed = getCollapsed;
    this.getMenuFixed = getMenuFixed;
    // Menu Type
    this.getMenuType = getMenuType;
    this.isMenuTopType = isMenuTopType;
    this.isMenuSidebarType = isMenuSidebarType;
    this.isMenuMixType = isMenuMixType;
    this.isMenuMixSidebarType = isMenuMixSidebarType;
    this.isMenuSidebarAndTopRecType = isMenuSidebarAndTopRecType;
    // Menu Mode
    this.getMenuMode = getMenuMode;
    this.isMenuVerMode = isMenuVerMode;
    this.isMenuHorMode = isMenuHorMode;
    this.isMenuVerRightMode = isMenuVerRightMode;
    this.isMenuInlineMode = isMenuInlineMode;
    this.getShowMenu = getShowMenu;
    this.getMenuHidden = getMenuHidden;
    this.getMenuWidth = getMenuWidth;
    this.getTrigger = getTrigger;
    this.getMenuTheme = getMenuTheme;
    this.getSplit = getSplit;
    this.getMenuBgColor = getMenuBgColor;
    this.getMixSideTrigger = getMixSideTrigger;
    this.getCanDrag = getCanDrag;
    this.getAccordion = getAccordion;
    this.getMixSideFixed = getMixSideFixed;
    this.getTopMenuAlign = getTopMenuAlign;
    this.getCloseMixSidebarOnChange = getCloseMixSidebarOnChange;
    this.getIsSidebarType = isMenuSidebarType;
    this.getIsTopMenu = isMenuTopType;
    this.getMenuShowLogo = getMenuShowLogo;
    this.getCollapsedShowTitle = getCollapsedShowTitle;
    this.getShowTopMenu = getShowTopMenu;
    this.getShowHeaderTrigger = getShowHeaderTrigger;
    this.getIsHorizontal = getIsHorizontal;
    this.getIsMixSidebar = isMenuMixSidebarType;
    this.getIsMixMode = getIsMixMode;
    this.getRealWidth = getRealWidth;
    this.getMiniWidthNumber = getMiniWidthNumber;
    this.getCalcContentWidth = getCalcContentWidth;
    this.getShowSidebar = getShowSidebar;
    this.setMenuSetting = setMenuSetting;
    this.toggleCollapsed = toggleCollapsed;
  }
}