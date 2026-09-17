import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'

/** 可序列化路由结构：path 与行为配置，不含展示信息和组件 */
export type SystemRouteStructure = {
  path: string
  name: string
  component?: GrowRouteComponent
  dynamicTab?: boolean
  breadcrumbParentName?: string
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
      },
      {
        path: 'role-manage',
        name: 'RoleManage',
      },
      {
        path: 'account-manage',
        name: 'AccountManage',
      },
      {
        path: 'person-manage',
        name: 'PersonManage',
        children: [
          {
            path: 'create',
            name: 'PersonCreate',
            dynamicTab: true,
            breadcrumbParentName: 'PersonManage',
          },
          {
            path: 'detail/:id',
            name: 'PersonDetail',
            dynamicTab: true,
            breadcrumbParentName: 'PersonManage',
          },
        ],
      },
      {
        path: 'dept-manage',
        name: 'DeptManage',
      },
      {
        path: 'post-manage',
        name: 'PostManage',
      },
      {
        path: 'position-manage',
        name: 'PositionManage',
      },
      {
        path: 'org-chart',
        name: 'OrgChart',
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
    const selfRoute = config.menuType === MenuTypeEnum.MENU
      ? [{
          ...config,
          fullPath: resolveSystemRouteFullPath(config, parentPath),
        }]
      : []

    if (config.children?.length) {
      const nextParentPath = buildChildParentPath(config, parentPath, isRootLevel)
      const childRoutes = flattenSystemRouteConfigs(config.children as SystemRouteConfig[], nextParentPath, false)
      return [...selfRoute, ...childRoutes]
    }

    return selfRoute
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
