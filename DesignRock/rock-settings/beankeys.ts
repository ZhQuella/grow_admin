import * as pack from './package.json';
import type { ServiceIdentifier } from '@grow-admin-rock/ioc';
import type { Setting, ProjectSetting, GlobConfig } from '@grow-admin-rock/types';
import { Beans as typeBeans } from '@grow-admin-rock/types';
import type {
  AppContextConfigration,
  RootSetting,
  MultipleTabSetting,
  MenuSettingData,
  HeaderSetting,
  TransitionSetting,
} from './src';
import type { AppStatus } from '#/AppStatus';

export default {
  /**
   * 工程配置项
   */
  GlobConfig: typeBeans.GlobConfig as ServiceIdentifier<GlobConfig>,
  /**
   * 应用状态, 对RootSetting进行了包装，方便App快速监听使用Setting值，如果要深度监听，使用RootSetting
   */
  AppStatus: Symbol.for(`${pack.name}/AppStatus`) as ServiceIdentifier<AppStatus>,
  /**
   * 应用全局上下文配置
   * @deprecated 准备移动到使用{@link AppContextConfigration}替代
   */
  SettingStore: Symbol.for(`${pack.name}/SettingStore`) as ServiceIdentifier<Setting.SettingStore>,
  /**
   * TODO 定义放到Types中，实现放在settings中
   */
  AppContextConfigration: Symbol.for(`${pack.name}/AppContextConfigration`) as ServiceIdentifier<AppContextConfigration>,
  /**
   * 用户项目默认配置
   */
  ProjectSetting: Symbol.for(`${pack.name}/ProjectSetting`) as ServiceIdentifier<ProjectSetting>,
  /**
   * 根配置
   * 对Setting.SettingStore; App.AppStore; RoutesTable;进行了包装
   */
  RootSetting: Symbol.for(`${pack.name}/RootSetting`) as ServiceIdentifier<RootSetting>,
  /**
   * 多页签设置
   */
  MultipleTabSetting: Symbol.for(`${pack.name}/MultipleTabSetting`) as ServiceIdentifier<MultipleTabSetting>,
  /**
   * 菜单设置
   */
  MenuSettingData: Symbol.for(`${pack.name}/MenuSettingData`) as ServiceIdentifier<MenuSettingData>,
  /**
   * 应用头部设置
   */
  HeaderSetting: Symbol.for(`${pack.name}/HeaderSetting`) as ServiceIdentifier<HeaderSetting>,
  /**
   * 全局过度动画设置
   */
  TransitionSetting: Symbol.for(`${pack.name}/TransitionSetting`) as ServiceIdentifier<TransitionSetting>,
};