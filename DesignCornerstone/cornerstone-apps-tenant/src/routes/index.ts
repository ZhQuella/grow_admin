import { MenuTypeEnum } from '@grow-admin-rock/constants'
import {
  TENANT_ROUTE_STRUCTURES,
  flattenTenantRouteConfigs,
  type TenantRouteConfig,
  type TenantRouteStructure,
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
  flattenTenantRouteConfigs,
  resolveTenantRouteFullPath,
  toTenantRouteConfigs,
} from './config'
export { TENANT_MENU_LIST } from './menuList'
export { TENANT_ROUTE_AUTHORITY } from './authority'
export {
  mergeTenantMenuWithStructure,
  toTenantRouteConfigsFromMenu,
} from './mergeMenu'

const TENANT_ROUTE_COMPONENTS: Record<string, GrowRouteComponent> = {
  TenantManage: () => import('../pages/tenant-manage/tenant-manage.vue'),
  ApplicationFunction: () => import('../pages/application-function/application-function.vue'),
  TenantMenu: () => import('../pages/tenant-menu/tenant-menu.vue'),
  TenantAdminRole: () => import('../pages/tenant-admin-role/tenant-admin-role.vue'),
  TenantAccount: () => import('../pages/tenant-account/tenant-account.vue'),
}

function bindTenantRouteComponents(
  structures: TenantRouteStructure[],
): TenantRouteStructure[] {
  return structures.map((structure) => ({
    ...structure,
    component: TENANT_ROUTE_COMPONENTS[structure.name],
    children: structure.children?.length
      ? bindTenantRouteComponents(structure.children)
      : structure.children,
  }))
}

export const TENANT_CLIENT_ROUTE_STRUCTURES = bindTenantRouteComponents(
  TENANT_ROUTE_STRUCTURES,
)

function resolveTenantComponent(config: TenantRouteConfig): GrowRouteComponent {
  if (!config.component) {
    throw new Error(`Tenant route "${String(config.name)}" is missing its component`)
  }
  return config.component
}

export const TENANT_ROUTES: RouteRecordItem[] = flattenTenantRouteConfigs(
  toTenantRouteConfigsFromMenu(undefined, TENANT_CLIENT_ROUTE_STRUCTURES),
).map(({ fullPath, ...config }) => resolveTenantRoute(config, fullPath))

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
