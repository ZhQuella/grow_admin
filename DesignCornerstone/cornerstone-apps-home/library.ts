import * as pack from './package.json';
import { install } from '@grow-admin-rock/base-package';
import { RouteList, createAuthGuard } from '#/routes';

export const Lib: ModuleLibContext<'types', any> = {
  install,
  name: pack.name,
  version: pack.version,
  routes: RouteList,
  onSetup(_app, appContext) {
    appContext.onIocLoaded(async () => {
      createAuthGuard();
    });
  },
};
