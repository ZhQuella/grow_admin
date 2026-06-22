import { ThemeEnum } from "@grow-admin-rock/constants"
import { Autowired, Bean } from "@grow-admin-rock/ioc"
import { Ref, ref, unref } from "vue"
import Beans from "#/../beankeys"
import type { RootSetting } from "#/RootSetting"

export interface AppStatus {
  /**
   * 获取前缀
   * @returns 
   */
  getPrefixCls: () => string
  /**
   * 是否是移动端
   * @returns 
   */
  isMobile: () => boolean
  /**
   * 是否是全屏状态
   * @returns 
   */
  isFullContent: () => boolean
  /**
   * 获取应用主题
   * @returns 
   */
  getTheme: () => ThemeEnum
  /**
   * 获取页面加载状态
   * @returns 
   */
  getPageLoading: () => boolean

  /**
   * @see RootSetting
   * @returns 
   */
  getRootSetting: () => RootSetting

  /**
   * 设置断点触发器
   */
  setPrefixCls: (prefix: string) => void
  /**
   * 设置是否是移动端
   */
  setIsMobile: (is: boolean) => void
  /**
   * 设置是否是移动端
   */
  setFullContent: (full: boolean) => void
  /**
   * 根据{@link isMobile}重制应用状态
   * @returns 
   */
  restoreState: () => void
  /**
   * @see AppStatusRefs
   */
  toRefs(): AppStatusRefs
}

/**
 * @description AppStatus的响应式对象
 */
export interface AppStatusRefs {
  /**
   * 获取前缀
   */
  getPrefixCls: Ref<string>
  /**
   * 是否是移动端
   */
  isMobile: Ref<boolean>
  /**
   * 是否是全屏状态
   */
  isFullContent: Ref<boolean>
  /**
   * 是否是暗黑模式
   */
  getTheme: Ref<ThemeEnum>
  /**
   * 是否在加载中
   */
  isPageLoading: Ref<boolean>
}

@Bean()
export class AppStatusContext implements AppStatus {

  getPrefixCls: () => string
  isMobile: () => boolean
  isFullContent: () => boolean
  getTheme: () => ThemeEnum
  getPageLoading: () => boolean
  getRootSetting: () => RootSetting
  setPrefixCls: (prefix: string) => void
  setIsMobile: (is: boolean) => void
  setFullContent: (full: boolean) => void
  restoreState: () => void
  toRefs: () => AppStatusRefs

  constructor(
    @Autowired(Beans.RootSetting) rootSetting: RootSetting
  ) {
    const settings = rootSetting;
    const prefixCls: Ref<string> = ref('vben');
    const mobileStatus: Ref<boolean> = ref(false);
    const isSetState: Ref<boolean> = ref(false);
    // 方法定义
    this.getPrefixCls = () => unref(prefixCls);
    this.isMobile = () => unref(mobileStatus);
    this.isFullContent = () => unref(rootSetting.getFullContent);
    this.getTheme = () => unref(settings.getDarkMode);
    this.getPageLoading = () => unref(settings.getPageLoading);
    this.getRootSetting = () => settings;
    this.setPrefixCls = (prefix: string) => prefixCls.value = prefix;
    this.setIsMobile = (is: boolean) => mobileStatus.value = is;
    this.setFullContent = (full: boolean) => settings.setProjectConfig({ getFullContent: ref(full) });
    this.toRefs = () => ({
      getPrefixCls: prefixCls,
      isMobile: mobileStatus,
      isFullContent: settings.getFullContent,
      getTheme: settings.getDarkMode,
      isPageLoading: settings.getPageLoading,
    })
    this.restoreState = () => {}
  }
}