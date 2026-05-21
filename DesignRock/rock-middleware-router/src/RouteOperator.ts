import { PageEnum, REDIRECT_NAME } from '@grow-admin-rock/constants';
import { FailData } from '@grow-admin-rock/types';
import {
  Autowired,
  Bean,
  THROWN_HANDLER,
  resolveByKey,
} from '@grow-admin-rock/ioc';
import { Beans } from '#/../beankeys'
import { Router, type RoutesTable, type RouteLocationRaw } from '#/../.';
import { unref } from 'vue';

export type PathAsPageEnum<T> = T extends { path: string }
  ? T & { path: PageEnum }
  : T;
export type RouteLocationRawEx = PathAsPageEnum<RouteLocationRaw>;

const handleError = (failData: FailData, e: Error) => {
  resolveByKey(THROWN_HANDLER)?.error(e.message, 'logger', undefined, e);
};

@Bean()
export class RouteOperator {
  routeTable: RoutesTable;
  router: Router;
  constructor(@Autowired(Beans.RouteTable) routeTable: RoutesTable) {
    this.routeTable = routeTable;
    this.router = routeTable.router;
  }
  go = (opt: RouteLocationRawEx = PageEnum.BASE_HOME, isReplace = false) => {
    if (!opt) {
      return;
    }
    isReplace
      ? this.router.replace(opt).catch(e => handleError({ message: 'Replace路由失败' }, e))
      : this.router.push(opt).catch(e => handleError({ message: 'Push路由失败' }, e));
  }
  redo = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const {
        query,
        params = {},
        name,
        fullPath,
      } = unref(this.router.currentRoute.value);
      if (name === REDIRECT_NAME) {
        resolve(false);
        return;
      }
      if (name && Object.keys(params).length > 0) {
        params['_redirect_type'] = 'name';
        params['path'] = String(name);
      } else {
        params['_redirect_type'] = 'path';
        params['path'] = fullPath;
      }
      this.router
        .push({ name: REDIRECT_NAME, params, query })
        .then(() => resolve(true));
    });
  }
}
