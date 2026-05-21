import { DefineAppConfigOptions } from '@grow-admin-rock/types';
import { RoutesTable } from './model/RoutesTable';
export * from './guard';
export * from './mitt/routeChange';
export * from './model/RoutesTable';
export * from './menus';
export * from './RouteOperator'

/**
 * 路由全局状态存储
 * @deprecated
 */
export interface Stores {
  userStore?: any;
  lockStore?: any;
  authStore?: any;
  appConfig?: DefineAppConfigOptions;
}
/**
 * @deprecated 使用依赖注入
 */
export let stores: Stores = {};

/**
 * 初始化路由
 * @param path publicPath
 * @param routeRecords 全路由清单
 * @returns
 */
export function InitRouter(
  path: string,
  basicRoutes: RouteRecordItem[],
  appRoutes: RouteRecordItem[]
): RoutesTable {
  return new RoutesTable(path, basicRoutes, appRoutes);
}

