import type { App } from 'vue';
import type { IocContainerOptions } from '@grow-admin-rock/ioc';
import { RouteList } from '@/routers/router';
import { installComponentDriver } from '../init-components-driver'
import { Lib as routeLib } from '@grow-admin-rock/middleware-router'


import { AppContext } from '@grow-admin-rock/base-package';
import {
  IocPlugin,
  AsyncIocModule,
  THROWN_HANDLER,
  diKT
} from '@grow-admin-rock/ioc';

import {
  InfrastructureOptions,
  Lib as infrastructureLib,
} from '@grow-admin-rock/infrastructure'

import { Lib as stateLib } from '@grow-admin-rock/state'

import { Lib as mockLib } from '@grow-admin-rock/mock'

import { Lib as componentsLib } from '@grow-admin-rock/components'

import {
  Lib as appsLoginLib,
  useUserStore,
} from '@grow-admin-cornerstone/apps-login'

import { bootstrapAppConfig } from '../initAppConfig'
import { GrowAxiosTransform } from '@/apis/infrastructure'
import { getGlobalConfig } from '@grow-admin-rock/utils'

// IOC插件配置
const iocOptions = {
  defaultScope: 'Singleton',
  autoBindInjectable: true,
  skipBaseClassChecks: true,
} as IocContainerOptions;

export const initIoc = async (app: App) => {
  const appContext = new AppContext();
  appContext.registerRoutes(RouteList);
  // IOC插件配置
  const iocOptions = {
    defaultScope: 'Singleton',
    autoBindInjectable: true,
    skipBaseClassChecks: true,
  } as IocContainerOptions;
  await installComponentDriver(app, appContext);

  app
    // 安装IOC插件
    .use(IocPlugin, iocOptions)
    // 使用基础设施
    .use(infrastructureLib, appContext)
    // 应用状态与主题配置
    .use(stateLib, appContext)
    // Mock 注册中心
    .use(mockLib, appContext)
    // 使用路由
    .use(routeLib, appContext)
    // 使用登录模块
    .use(appsLoginLib, appContext)
    // 使用契约组件库
    .use(componentsLib, appContext);

  appContext.iocModules.push(
    new AsyncIocModule(async (bind) => {
      bind(infrastructureLib.types.AxiosTransform).to(GrowAxiosTransform)
      bind(infrastructureLib.types.InfrastructureOptions).toDynamicValue(() => {
        const { apiUrl } = getGlobalConfig(import.meta.env)
        return { apiUrl } as InfrastructureOptions
      })
    }),
  )

  // 载入应用
  await appContext.load(app)

  bootstrapAppConfig()

  const router = diKT(routeLib.types.RouteTable).router
  app.use(router);

  // Mount when the route is ready
  await router.isReady();

};
