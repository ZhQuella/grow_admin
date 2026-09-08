import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'

/** 客户端路由结构：path、组件映射，不含展示信息 */
export type TenantRouteStructure = {
  path: string
  name: string
  componentKey?: string
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
        componentKey: 'TenantManage',
      },
      {
        path: 'application-function',
        name: 'ApplicationFunction',
        componentKey: 'ApplicationFunction',
      },
      {
        path: 'tenant-menu',
        name: 'TenantMenu',
        componentKey: 'TenantMenu',
      },
      {
        path: 'tenant-admin-role',
        name: 'TenantAdminRole',
        componentKey: 'TenantAdminRole',
      },
      {
        path: 'tenant-account',
        name: 'TenantAccount',
        componentKey: 'TenantAccount',
      },
    ],
  },
]

export type TenantRouteLeaf = TenantRouteConfig & {
  fullPath: string
}

function buildChildParentPath(
  config: TenantRouteStructure,
  parentPath: string,
  isRootLevel: boolean,
): string {
  if (isRootLevel) {
    return ''
  }
  return parentPath ? `${parentPath}/${config.path}` : config.path
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
  isRootLevel = true,
): TenantRouteLeaf[] {
  return configs.flatMap((config) => {
    if (config.children?.length) {
      const nextParentPath = buildChildParentPath(config, parentPath, isRootLevel)
      const childRoutes = flattenTenantRouteConfigs(config.children, nextParentPath, false)
      const selfRoute = config.componentKey != null
        ? [{
            ...config,
            fullPath: resolveTenantRouteFullPath(config, parentPath),
          }]
        : []
      return [...selfRoute, ...childRoutes]
    }

    return [{
      ...config,
      fullPath: resolveTenantRouteFullPath(config, parentPath),
    }]
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

export const TENANT_COMPONENT_KEYS = new Set([
  'TenantManage',
  'ApplicationFunction',
  'TenantMenu',
  'TenantAdminRole',
  'TenantAccount',
])

export const TENANT_COMPONENT_PAGE_NAMES: Record<string, string> = {
  TenantManage: 'TenantManagePage',
  ApplicationFunction: 'ApplicationFunctionPage',
  TenantMenu: 'TenantMenuPage',
  TenantAdminRole: 'TenantAdminRolePage',
  TenantAccount: 'TenantAccountPage',
}

export function resolveTenantPageComponentName(componentKey: string): string {
  return TENANT_COMPONENT_PAGE_NAMES[componentKey] ?? componentKey
}

export function isTenantRouteConfig(config: { componentKey?: string, name: string | symbol }): boolean {
  const key = String(config.componentKey ?? config.name)
  return TENANT_COMPONENT_KEYS.has(key)
}
