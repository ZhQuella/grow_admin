import type { App } from 'vue';
import type { AppContext } from '@grow-admin-rock/base-package';
import type { GrowAdminComponentDriver } from '@grow-admin-rock/component-driver';
import { ContextParamDef, setMessage, setNotice, setDialog } from '@grow-admin-rock/components';
import { ComponentLibraryType } from '@grow-admin-rock/types';
import { projectSetting } from './projectSetting';

type DriverFactory = () => GrowAdminComponentDriver;

const driverFactories: Record<ComponentLibraryType, () => Promise<DriverFactory>> = {
  [ComponentLibraryType.ElementPlus]: async () => {
    const { EPComponentDriver } = await import('@grow-admin-rock/component-driver-element-plus');
    return () => EPComponentDriver.builder().enableAll();
  },
  [ComponentLibraryType.NaiveUI]: async () => {
    const { NaiveComponentDriver } = await import('@grow-admin-rock/component-driver-naive');
    const { useMessage } = await import('naive-ui');
    const { useNotification } = await import('naive-ui');
    const { useDialog } = await import('naive-ui');
    setMessage(useMessage);
    setNotice(useNotification);
    setDialog(useDialog);
    return () => NaiveComponentDriver.builder().enableAll();
  },
  [ComponentLibraryType.AntDesignVue]: async () => {
    const { AntdvComponentDriver } = await import('@grow-admin-rock/component-driver-antdv');
    const { message, notification, Modal } = await import('ant-design-vue');
    setMessage(() => message);
    setNotice(() => notification);
    setDialog(() => Modal);
    return () => AntdvComponentDriver.builder().enableAll();
  },
};

export async function installComponentDriver(app: App, context: AppContext) {
  const libraryType = projectSetting.componentLibrary;
  const factoryLoader = driverFactories[libraryType];

  if (!factoryLoader) {
    throw new Error(`不支持的组件库类型: ${libraryType}`);
  }

  const createDriver = await factoryLoader();
  const driver = createDriver();
  const dictionary = driver.componentDictoray();

  context.registerParam(ContextParamDef.DriverComponentDictionary, dictionary);
  console.info(`[ComponentDriver] 已加载组件库驱动: ${libraryType}`);
}
