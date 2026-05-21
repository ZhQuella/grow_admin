import type { App } from 'vue';
import type { IocContainerOptions } from '@grow-admin-rock/ioc';

import { APP_CONTEXT, AppContext } from '@grow-admin-rock/base-package';
import {
  IocPlugin,
  AsyncIocModule,
  THROWN_HANDLER,
  diKT
} from '@grow-admin-rock/ioc';

// IOC插件配置
const iocOptions = {
  defaultScope: 'Singleton',
  autoBindInjectable: true,
  skipBaseClassChecks: true,
} as IocContainerOptions;

export const initIoc = (app: App) => {
  app.use(IocPlugin, iocOptions);
};
