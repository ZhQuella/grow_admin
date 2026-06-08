import { type ServiceIdentifier, diKT } from '@grow-admin-rock/ioc';
import { Beans, type GlobConfig } from '@grow-admin-rock/types';
import { type MenuSettingData, Beans as settingBeans } from '@grow-admin-rock/settings';

/**
 * 全局配置获取（配置文件）
 * @returns 
 */
export const useGlobConfig = () => {
  return diKT(Beans.GlobConfig as ServiceIdentifier<GlobConfig>)
};

/**
 * 多页签行为设置
 * @returns 
 */
export const useMultipleTabSetting = () => {
  return diKT(settingBeans.MultipleTabSetting)
}

/**
 * 菜单设置
 * @returns 
 */
export const useMenuSetting = (): MenuSettingData => {
  return diKT(settingBeans.MenuSettingData)
}

/**
 * 应用Header设置
 * alias for diKT(settingBeans.HeaderSetting)
 * @returns 
 */
export function useHeaderSetting() {
  return diKT(settingBeans.HeaderSetting)
}

/**
 * 应用基础设置
 * alias for diKT(settingBeans.RootSetting)
 * @returns 
 */
export function useRootSetting() {
  return diKT(settingBeans.RootSetting)
}

/**
 * 重置工程所有设置
 */
export function resetProjectSetting() {
  const settingStore = diKT(settingBeans.SettingStore);
  settingStore.resetProjectConfig()
}