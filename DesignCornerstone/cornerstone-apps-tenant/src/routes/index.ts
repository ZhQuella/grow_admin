import { MenuTypeEnum } from '@grow-admin-rock/constants'
import {
  flattenTenantRouteConfigs,
  resolveTenantPageComponentName,
  type TenantRouteConfig,
} from './config'
import { toTenantRouteConfigsFromMenu } from './mergeMenu'

export type {
  TenantRouteConfig,
  TenantRouteLeaf,
  TenantRouteStructure,
  TenantMenuApiItem,
} from './config'
export {
  TENANT_ROUTE_STRUCTURES,
  TENANT_COMPONENT_KEYS,
  TENANT_COMPONENT_PAGE_NAMES,
  flattenTenantRouteConfigs,
  isTenantRouteConfig,
  resolveTenantPageComponentName,
  resolveTenantRouteFullPath,
  toTenantRouteConfigs,
} from './config'
export { TENANT_MENU_LIST } from './menuList'
export { TENANT_ROUTE_AUTHORITY } from './authority'
export {
  mergeTenantMenuWithStructure,
  toTenantRouteConfigsFromMenu,
} from './mergeMenu'

const TENANT_COMPONENTS: Record<string, GrowRouteComponent> = {
  TenantManage: () => import('../pages/tenant-manage/tenant-manage.vue'),
  TenantMenu: () => import('../pages/tenant-menu/tenant-menu.vue'),
  TenantAdminRole: () => import('../pages/tenant-admin-role/tenant-admin-role.vue'),
  TenantAccount: () => import('../pages/tenant-account/tenant-account.vue'),
}

function resolveTenantComponent(config: TenantRouteConfig): GrowRouteComponent {
  const componentKey = String(config.componentKey ?? config.name)
  const component = TENANT_COMPONENTS[componentKey]
  if (!component) {
    throw new Error(`Unknown tenant component: ${componentKey}`)
  }
  return component
}

export const TENANT_ROUTES: RouteRecordItem[] = flattenTenantRouteConfigs(
  toTenantRouteConfigsFromMenu(),
).map(({ fullPath, ...config }) => ({
  ...config,
  path: fullPath,
  component: resolveTenantComponent(config),
}))

export function resolveTenantRoute(
  config: TenantRouteConfig,
  fullPath = config.path,
): RouteRecordItem {
  return {
    path: fullPath,
    name: config.name,
    component: resolveTenantComponent(config),
    meta: {
      title: config.title,
      componentName: resolveTenantPageComponentName(String(config.componentKey ?? config.name)),
      isKeepAlive: config.isKeepAlive !== false,
    },
    icon: config.icon,
  }
}

export function toTenantRouteConfig(route: RouteRecordItem): TenantRouteConfig {
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
