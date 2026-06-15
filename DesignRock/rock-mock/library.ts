import type { CommonModuleLibContext } from '@grow-admin-rock/base-package';
import { install } from '@grow-admin-rock/base-package';
import { AsyncIocModule } from '@grow-admin-rock/ioc';
import * as pack from './package.json';
import { globalMockRegistry } from '#/MockRegistry';
import types from './beankeys';

export const Lib: CommonModuleLibContext<typeof types> = {
  install,
  name: pack.name,
  version: pack.version,
  types,
  module: new AsyncIocModule(async (bind) => {
    console.debug(`【${pack.name}】 IocModule start load`);
    bind(types.MockRegistry).toConstantValue(globalMockRegistry);
    bind(types.MockEnabled).toConstantValue(__VITE_USE_MOCK__);
  }),
};
