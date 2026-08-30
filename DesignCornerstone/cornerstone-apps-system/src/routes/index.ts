import { MenuTypeEnum } from '@grow-admin-rock/constants'
import {
  flattenSystemRouteConfigs,
  resolveSystemPageComponentName,
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
  RoleManage: () => import('../pages/role-manage/role-manage.vue'),
  AccountManage: () => import('../pages/account-manage/account-manage.vue'),
  PersonManage: () => import('../pages/person-manage/person-manage.vue'),
  PersonCreate: () => import('../pages/person-manage/person-form.vue'),
  PersonDetail: () => import('../pages/person-manage/person-detail.vue'),
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

const PERSON_FORM_PARENT_BY_NAME: Record<string, string> = {
  PersonCreate: 'PersonManage',
  PersonDetail: 'PersonManage',
}

export function resolveSystemRoute(
  config: SystemRouteConfig,
  fullPath = config.path,
): RouteRecordItem {
  const breadcrumbParentName = PERSON_FORM_PARENT_BY_NAME[config.name]
  const componentKey = String(config.componentKey ?? config.name)
  return {
    path: fullPath,
    name: config.name,
    component: resolveSystemComponent(config),
    meta: {
      title: config.title,
      componentName: resolveSystemPageComponentName(componentKey),
      isKeepAlive: config.isKeepAlive !== false,
      ...(breadcrumbParentName
        ? {
            dynamicTab: true,
            breadcrumbParentName,
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
