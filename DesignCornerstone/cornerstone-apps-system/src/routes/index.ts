import { MenuTypeEnum } from '@grow-admin-rock/constants'
import {
  flattenSystemRouteConfigs,
  type SystemRouteConfig,
} from './config'
import { toSystemRouteConfigsFromMenu } from './mergeMenu'

export type {
  SystemRouteConfig,
  SystemRouteLeaf,
  SystemRouteStructure,
  SystemMenuApiItem,
} from './config'
export {
  SYSTEM_ROUTE_STRUCTURES,
  SYSTEM_COMPONENT_KEYS,
  SYSTEM_COMPONENT_PAGE_NAMES,
  flattenSystemRouteConfigs,
  isSystemRouteConfig,
  resolveSystemPageComponentName,
  resolveSystemRouteFullPath,
  toSystemRouteConfigs,
} from './config'
export { SYSTEM_MENU_LIST } from './menuList'
export { SYSTEM_ROUTE_AUTHORITY } from './authority'
export {
  mergeSystemMenuWithStructure,
  toSystemRouteConfigsFromMenu,
} from './mergeMenu'

const SYSTEM_COMPONENTS: Record<string, GrowRouteComponent> = {
  MenuManage: () => import('../pages/menu-manage/menu-manage.vue'),
}

function resolveSystemComponent(config: SystemRouteConfig): GrowRouteComponent {
  const componentKey = String(config.componentKey ?? config.name)
  const component = SYSTEM_COMPONENTS[componentKey]
  if (!component) {
    throw new Error(`Unknown system component: ${componentKey}`)
  }
  return component
}

export const SYSTEM_ROUTES: RouteRecordItem[] = flattenSystemRouteConfigs(
  toSystemRouteConfigsFromMenu(),
).map(({ fullPath, ...config }) => ({
  ...config,
  path: fullPath,
  component: resolveSystemComponent(config),
}))

export function resolveSystemRoute(
  config: SystemRouteConfig,
  fullPath = config.path,
): RouteRecordItem {
  return {
    path: fullPath,
    name: config.name,
    component: resolveSystemComponent(config),
    meta: { title: config.title },
    icon: config.icon,
  }
}

export function toSystemRouteConfig(route: RouteRecordItem): SystemRouteConfig {
  const { path, name, meta, icon } = route
  return {
    path,
    name: String(name),
    title: String(meta?.title ?? name),
    icon,
    menuType: MenuTypeEnum.MENU,
    isVisible: true,
  }
}
