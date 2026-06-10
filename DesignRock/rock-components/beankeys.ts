import * as pack from './package.json';
import type { ServiceIdentifier } from '@grow-admin-rock/ioc';
import type { AppContextPropertyGeneric } from '@grow-admin-rock/base-package';
import type ComponentMap from '#/ComponentMap';

export const AppContextParamDef = {
  DriverComponentDictionary: Symbol.for(
    `${pack.name}/DriverComponentDictionary`,
  ) as AppContextPropertyGeneric<GrowComponentDictionary>,
};

export default {
  ComponentMap: Symbol.for(`${pack.name}/ComponentMap`) as ServiceIdentifier<ComponentMap>,
};
