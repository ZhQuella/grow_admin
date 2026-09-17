import { MenuTypeEnum } from '@grow-admin-rock/constants'
import {
  SYSTEM_ROUTE_STRUCTURES,
  flattenSystemRouteConfigs,
  type SystemRouteConfig,
  type SystemRouteStructure,
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
  flattenSystemRouteConfigs,
  resolveSystemRouteFullPath,
  toSystemRouteConfigs,
} from './config'
export { SYSTEM_MENU_LIST } from './menuList'
export { SYSTEM_ROUTE_AUTHORITY } from './authority'
export {
  mergeSystemMenuWithStructure,
  toSystemRouteConfigsFromMenu,
} from './mergeMenu'

const SYSTEM_ROUTE_COMPONENTS: Record<string, GrowRouteComponent> = {
  MenuManage: () => import('../pages/menu-manage/menu-manage.vue'),
  RoleManage: () => import('../pages/role-manage/role-manage.vue'),
  AccountManage: () => import('../pages/account-manage/account-manage.vue'),
  PersonManage: () => import('../pages/person-manage/person-manage.vue'),
  PersonCreate: () => import('../pages/person-manage/person-form.vue'),
  PersonDetail: () => import('../pages/person-manage/person-detail.vue'),
  DeptManage: () => import('../pages/dept-manage/dept-manage.vue'),
  PostManage: () => import('../pages/post-manage/post-manage.vue'),
  PositionManage: () => import('../pages/position-manage/position-manage.vue'),
  OrgChart: () => import('../pages/org-chart/org-chart.vue'),
}

function bindSystemRouteComponents(
  structures: SystemRouteStructure[],
): SystemRouteStructure[] {
  return structures.map((structure) => ({
    ...structure,
    component: SYSTEM_ROUTE_COMPONENTS[structure.name],
    children: structure.children?.length
      ? bindSystemRouteComponents(structure.children)
      : structure.children,
  }))
}

export const SYSTEM_CLIENT_ROUTE_STRUCTURES = bindSystemRouteComponents(
  SYSTEM_ROUTE_STRUCTURES,
)

function resolveSystemComponent(config: SystemRouteConfig): GrowRouteComponent {
  if (!config.component) {
    throw new Error(`System route "${String(config.name)}" is missing its component`)
  }
  return config.component
}

export const SYSTEM_ROUTES: RouteRecordItem[] = flattenSystemRouteConfigs(
  toSystemRouteConfigsFromMenu(undefined, SYSTEM_CLIENT_ROUTE_STRUCTURES),
).map(({ fullPath, ...config }) => resolveSystemRoute(config, fullPath))

export function resolveSystemRoute(
  config: SystemRouteConfig,
  fullPath = config.path,
): RouteRecordItem {
  return {
    path: fullPath,
    name: config.name,
    component: resolveSystemComponent(config),
    meta: {
      title: config.title,
      isKeepAlive: config.isKeepAlive !== false,
      ...(config.breadcrumbParentName
        ? {
            dynamicTab: config.dynamicTab,
            breadcrumbParentName: config.breadcrumbParentName,
          }
        : {}),
    },
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
