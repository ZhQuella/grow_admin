import * as pack from "./package.json"
import { install } from '@weiming-rock/base-package';
import type { ModuleLibContext } from '@weiming-rock/base-package';
import { AsyncIocModule } from '@weiming-rock/ioc';
import { useUserStore } from '#/domain';
import { Lib as layoutLib } from '@weiming-rock/layouts-component';
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
