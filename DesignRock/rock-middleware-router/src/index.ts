import { RoutesTable } from './model/RoutesTable';
export * from './model/RoutesTable';
export * from './RouteOperator'

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
