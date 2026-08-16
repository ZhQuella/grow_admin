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

import { Lib as localeLib } from '@grow-admin-rock/locale'

import { Lib as componentsLib } from '@grow-admin-rock/components'

import { Lib as appsLoginLib } from '@grow-admin-cornerstone/apps-login'
import { Lib as appsHomeLib } from '@grow-admin-cornerstone/apps-home'
import { Lib as appsExternalLib } from '@grow-admin-cornerstone/apps-external'
import { Lib as appsFeatLib } from '@grow-admin-cornerstone/apps-feat'
import { Lib as appsWorkspaceLib } from '@grow-admin-cornerstone/apps-workspace'
import { Lib as appsSandboxLib } from '@grow-admin-cornerstone/apps-sandbox'
import { Lib as appsDesignerLib } from '@grow-admin-cornerstone/apps-designer'
import { Lib as appsSystemLib } from '@grow-admin-cornerstone/apps-system'

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
    // 多语言
    .use(localeLib, appContext)
    // Mock 注册中心
    .use(mockLib, appContext)
    // 使用路由
    .use(routeLib, appContext)
    // 使用登录模块
    .use(appsLoginLib, appContext)
    // 使用首页模块
    .use(appsHomeLib, appContext)
    // 使用工作区模块
    .use(appsWorkspaceLib, appContext)
    // 使用沙箱工具演示模块
    .use(appsSandboxLib, appContext)
    // 使用设计器演示模块
    .use(appsDesignerLib, appContext)
    // 使用系统管理模块
    .use(appsSystemLib, appContext)
    // 使用外部页面演示模块
    .use(appsExternalLib, appContext)
    // 使用功能示例模块
    .use(appsFeatLib, appContext)
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
