import { ComponentLibraryType } from '@grow-admin-rock/types';
import type { ProjectSetting } from '@grow-admin-rock/types';
import {
  CacheTypeEnum,
  PermissionModeEnum,
  SessionTimeoutProcessingEnum,
  SettingButtonPositionEnum,
  RouterTransitionEnum,
} from '@grow-admin-rock/constants';

/**
 * 项目配置 - 开发/生产环境通过此文件确定组件库
 */
export const projectSetting: ProjectSetting = {
  componentLibrary: ComponentLibraryType.ElementPlus,
  lockTime: 15,
  useLockPage: true,
  useOpenBackTop: true,
  canEmbedIFramePage: true,
  closeMessageOnSwitch: true,
  removeAllHttpPending: false,
  permissionCacheType: CacheTypeEnum.LOCAL,
  showSettingButton: true,
  showDarkModeToggle: true,
  settingButtonPosition: SettingButtonPositionEnum.AUTO,
  showSettingDrawer: true,
  permissionMode: PermissionModeEnum.MIXTURE,
  sessionTimeoutProcessing: SessionTimeoutProcessingEnum.ROUTE_JUMP,
  themeColor: '#8b5cf6',
  transitionSetting: {
    enable: true,
    basicTransition: RouterTransitionEnum.FADE_SIDE,
  },
};
