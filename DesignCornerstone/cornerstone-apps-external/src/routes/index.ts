import { resolveDisparkRoute } from '@grow-admin-cornerstone/apps-dispark'
import type { ExternalRouteConfig } from './config'

export function resolveExternalRoute(
  config: ExternalRouteConfig,
  fullPath = config.path,
): RouteRecordItem {
  const route = resolveDisparkRoute(config, fullPath)
  route.meta = {
    ...route.meta,
    isExternalPage: config.isExternalPage,
  }
  return route
}

export * from './config'
export { mergeExternalMenuWithStructure } from './mergeMenu'
