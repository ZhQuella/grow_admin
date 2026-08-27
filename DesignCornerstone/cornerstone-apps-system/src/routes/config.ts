import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'

/** 客户端路由结构：path、组件映射，不含展示信息 */
export type SystemRouteStructure = {
  path: string
  name: string
  componentKey?: string
  children?: SystemRouteStructure[]
}

/** 接口返回的菜单展示信息 */
export type SystemMenuApiItem = {
  name: string
  title: string
  icon?: string
  menuType: MenuTypeEnum
  isVisible: boolean
  isKeepAlive?: boolean
  affix?: boolean
  defaultShow?: boolean
  sort?: number
  isExternalPage?: boolean
  openMode?: PageOpenModeEnum
  link?: string
  children?: SystemMenuApiItem[]
}

/** 合并后的完整菜单/路由配置 */
export type SystemRouteConfig = SystemRouteStructure & {
  title: string
  icon?: string
  menuType: MenuTypeEnum
  isVisible: boolean
  isKeepAlive?: boolean
  affix?: boolean
  defaultShow?: boolean
  sort?: number
  isExternalPage?: boolean
  openMode?: PageOpenModeEnum
  link?: string
}

export const SYSTEM_ROUTE_STRUCTURES: SystemRouteStructure[] = [
  {
    path: 'system-catalog',
    name: 'SystemCatalog',
    children: [
      {
        path: 'menu-manage',
        name: 'MenuManage',
        componentKey: 'MenuManage',
      },
      {
        path: 'role-manage',
        name: 'RoleManage',
        componentKey: 'RoleManage',
      },
      {
        path: 'person-manage',
        name: 'PersonManage',
        componentKey: 'PersonManage',
        children: [
          {
            path: 'create',
            name: 'PersonCreate',
            componentKey: 'PersonCreate',
          },
          {
            path: 'edit/:id',
            name: 'PersonEdit',
            componentKey: 'PersonEdit',
          },
          {
            path: 'detail/:id',
            name: 'PersonDetail',
            componentKey: 'PersonDetail',
          },
        ],
      },
    ],
  },
]

export type SystemRouteLeaf = SystemRouteConfig & {
  fullPath: string
}

function buildChildParentPath(
  config: SystemRouteStructure,
  parentPath: string,
  isRootLevel: boolean,
): string {
  if (isRootLevel) {
    return ''
  }
  return parentPath ? `${parentPath}/${config.path}` : config.path
}

export function resolveSystemRouteFullPath(
  config: SystemRouteStructure,
  parentPath = '',
): string {
  return parentPath ? `${parentPath}/${config.path}` : config.path
}

export function flattenSystemRouteConfigs(
  configs: SystemRouteConfig[],
  parentPath = '',
  isRootLevel = true,
): SystemRouteLeaf[] {
  return configs.flatMap((config) => {
    if (config.children?.length) {
      const nextParentPath = buildChildParentPath(config, parentPath, isRootLevel)
      const childRoutes = flattenSystemRouteConfigs(config.children, nextParentPath, false)
      const selfRoute = config.componentKey != null
        ? [{
            ...config,
            fullPath: resolveSystemRouteFullPath(config, parentPath),
          }]
        : []
      return [...selfRoute, ...childRoutes]
    }

    return [{
      ...config,
      fullPath: resolveSystemRouteFullPath(config, parentPath),
    }]
  })
}

function withDefaultTitle(structure: SystemRouteStructure): SystemRouteConfig {
  return {
    ...structure,
    title: structure.name,
    menuType: structure.children?.length ? MenuTypeEnum.DIRECTORY : MenuTypeEnum.MENU,
    isVisible: true,
    children: structure.children?.map(withDefaultTitle),
  }
}

export function toSystemRouteConfigs(
  structures: SystemRouteStructure[] = SYSTEM_ROUTE_STRUCTURES,
): SystemRouteConfig[] {
  return structures.map(withDefaultTitle)
}

export const SYSTEM_COMPONENT_KEYS = new Set([
  'MenuManage',
  'RoleManage',
  'PersonManage',
  'PersonCreate',
  'PersonEdit',
  'PersonDetail',
])

export const SYSTEM_COMPONENT_PAGE_NAMES: Record<string, string> = {
  MenuManage: 'MenuManagePage',
  RoleManage: 'RoleManagePage',
  PersonManage: 'PersonManagePage',
  PersonCreate: 'PersonFormPage',
  PersonEdit: 'PersonFormPage',
  PersonDetail: 'PersonDetailPage',
}

export function resolveSystemPageComponentName(componentKey: string): string {
  return SYSTEM_COMPONENT_PAGE_NAMES[componentKey] ?? componentKey
}

export function isSystemRouteConfig(config: { componentKey?: string, name: string | symbol }): boolean {
  const key = String(config.componentKey ?? config.name)
  return SYSTEM_COMPONENT_KEYS.has(key)
}
