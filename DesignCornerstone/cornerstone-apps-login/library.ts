import * as pack from "./package.json"
import { install } from '@grow-admin-rock/base-package';
import type { ModuleLibContext } from '@grow-admin-rock/base-package';
import { AsyncIocModule } from '@grow-admin-rock/ioc';
import { useUserStore } from '#/domain';
import { Lib as layoutLib } from '@grow-admin-rock/layouts-component';
import { RouteList } from '#/.'

export const Lib: ModuleLibContext<'types', any> = {
  install,
  name: pack.name,
  version: pack.version,
  module: new AsyncIocModule(async (bind, unbind, isBound) => {
    console.debug(`${pack.name} IocModule start load`);
    bind(layoutLib.types.UserStore).toConstantValue(useUserStore());
  }),
  routes: RouteList
};
