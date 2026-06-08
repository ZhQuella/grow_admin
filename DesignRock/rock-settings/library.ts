import type { CommonModuleLibContext } from '@grow-admin-rock/base-package';
import { install } from '@grow-admin-rock/base-package';
import * as pack from './package.json';
import { AsyncIocModule, di, diK } from '@grow-admin-rock/ioc';
import { useSettingStore } from '#/SettingStore';
import types from './beankeys';
import {
  MultipleTabSetting,
  MenuSettingData,
  RootSetting,
  HeaderSetting,
  TransitionSetting,
} from '#/.';
import { getGlobalConfig } from '@grow-admin-rock/utils';
import { AppStatusContext } from '#/AppStatus';

export const Lib: CommonModuleLibContext<typeof types> = {
  install,
  name: pack.name,
  version: pack.version,
  types,
  module: new AsyncIocModule(async (bind) => {
    console.debug(`${pack.name} IocModule start load`);
    bind(types.SettingStore).toConstantValue(useSettingStore());
    bind(types.MultipleTabSetting).to(MultipleTabSetting);
    bind(types.RootSetting).to(RootSetting);
    bind(types.MenuSettingData).to(MenuSettingData);
    bind(types.HeaderSetting).to(HeaderSetting);
    bind(types.TransitionSetting).to(TransitionSetting);
    bind(types.GlobConfig).toConstantValue(getGlobalConfig(import.meta.env));
    bind(types.AppStatus).to(AppStatusContext);
  }),
  onSetup: async (app, appContext) => {
    console.debug(`【${pack.name}】 onSetup start`);
    const settingStore = await di(types.SettingStore);
    // TODO: 从后端获取配置或者SettingStore中增加默认配置
    if (settingStore.projectConfig) {
      console.debug(`【${pack.name}】 onSetup projectConfig exists, skip load`);
    } else {
      await settingStore.setProjectConfig(
        diK(types.ProjectSetting)
          || (await import('#/defaultConfig/ProjectSetting')).default
      );
    }
  }
};
