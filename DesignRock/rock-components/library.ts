import type { Library } from '@grow-admin-rock/base-package';
import { toPackage } from '@grow-admin-rock/base-package';
import * as pack from './package.json';
import { AsyncIocModule } from '@grow-admin-rock/ioc';
import ComponentMap from '#/ComponentMap';
import { default as Beans, AppContextParamDef } from './beankeys';
import { registerGrowComponent } from './src';

export const Lib: Library<typeof Beans> = toPackage({
  name: pack.name,
  version: pack.version,
  types: Beans,
  module: new AsyncIocModule(async (bind) => {
    console.debug(`[${pack.name}] IocModule start load`);
    bind(Beans.ComponentMap).toConstantValue(new ComponentMap());
  }),
  onSetup: async (app, appContext) => {
    const componentMap: GrowComponentDictionary = appContext.getParam(
      AppContextParamDef.DriverComponentDictionary,
    );
    registerGrowComponent(app, componentMap);
  },
});
