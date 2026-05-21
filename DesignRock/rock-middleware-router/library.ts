import * as pack from './package.json';
import { AsyncIocModule } from '@grow-admin-rock/ioc';
import { APP_CONTEXT, CommonModuleLibContext } from '@grow-admin-rock/base-package';
import type { AppContext } from '@grow-admin-rock/base-package';
import { install } from '@grow-admin-rock/base-package';
import { InitRouter, RouteOperator, RoutesTable } from '#/.';
import { MenuState } from '#/model/MenuState';
import { Beans } from './beankeys';
import type { BeanKeys } from './beankeys';

export const Lib: CommonModuleLibContext<BeanKeys> = {
  install,
  name: pack.name,
  version: pack.version,
  types: Beans,
  module: new AsyncIocModule(async (bind) => {
    bind<MenuState>(Beans.MenuState).to(MenuState);
    bind<RouteOperator>(Beans.RouteOperator).to(RouteOperator);
    bind<RoutesTable>(Beans.RouteTable).toDynamicValue((context) => {
      const appContext = context.container.get<AppContext>(APP_CONTEXT);
      console.debug('All Routes List', appContext.basicRoutes, appContext.appRoutes);
      return InitRouter(import.meta.env.VITE_PUBLIC_PATH, appContext.basicRoutes, appContext.appRoutes);
    });
  }),
  async onSetup(app) {
    // TODO 路由中间件挂载路由会导致路由守卫失效，暂时不使用，待调查原因
    // const routeTable = await di(types.RouteTable);
    // app.use(routeTable.router);
    // await routeTable.router.isReady();
    // console.log('Router Setup');
  },
};
