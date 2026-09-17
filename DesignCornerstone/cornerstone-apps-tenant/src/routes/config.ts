import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'

/** 可序列化路由结构：path 与行为配置，不含展示信息和组件 */
export type TenantRouteStructure = {
  path: string
  name: string
  component?: GrowRouteComponent
  children?: TenantRouteStructure[]
}

/** 接口返回的菜单展示信息 */
export type TenantMenuApiItem = {
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
  children?: TenantMenuApiItem[]
}

/** 合并后的完整菜单/路由配置 */
export type TenantRouteConfig = TenantRouteStructure & {
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

export const TENANT_ROUTE_STRUCTURES: TenantRouteStructure[] = [
  {
    path: 'tenant-catalog',
    name: 'TenantCatalog',
    children: [
      {
        path: 'tenant-manage',
        name: 'TenantManage',
      },
      {
        path: 'application-function',
        name: 'ApplicationFunction',
      },
      {
        path: 'tenant-menu',
        name: 'TenantMenu',
      },
      {
        path: 'tenant-admin-role',
        name: 'TenantAdminRole',
      },
      {
        path: 'tenant-account',
        name: 'TenantAccount',
      },
    ],
  },
]

export type TenantRouteLeaf = TenantRouteConfig & {
  fullPath: string
}

function buildChildParentPath(
  config: TenantRouteConfig,
  parentPath: string,
): string {
  return config.menuType === MenuTypeEnum.DIRECTORY
    ? parentPath
    : resolveTenantRouteFullPath(config, parentPath)
}

export function resolveTenantRouteFullPath(
  config: TenantRouteStructure,
  parentPath = '',
): string {
  return parentPath ? `${parentPath}/${config.path}` : config.path
}

export function flattenTenantRouteConfigs(
  configs: TenantRouteConfig[],
  parentPath = '',
): TenantRouteLeaf[] {
  return configs.flatMap((config) => {
    const selfRoute = config.menuType === MenuTypeEnum.MENU
      ? [{
          ...config,
          fullPath: resolveTenantRouteFullPath(config, parentPath),
        }]
      : []

    if (config.children?.length) {
      const nextParentPath = buildChildParentPath(config, parentPath)
      const childRoutes = flattenTenantRouteConfigs(config.children as TenantRouteConfig[], nextParentPath)
      return [...selfRoute, ...childRoutes]
    }

    return selfRoute
  })
}

function withDefaultTitle(structure: TenantRouteStructure): TenantRouteConfig {
  return {
    ...structure,
    title: structure.name,
    menuType: structure.children?.length ? MenuTypeEnum.DIRECTORY : MenuTypeEnum.MENU,
    isVisible: true,
    children: structure.children?.map(withDefaultTitle),
  }
}

export function toTenantRouteConfigs(
  structures: TenantRouteStructure[] = TENANT_ROUTE_STRUCTURES,
): TenantRouteConfig[] {
  return structures.map(withDefaultTitle)
}
