import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'

/** 客户端路由结构：path、组件映射，不含展示信息 */
export type WorkspaceRouteStructure = {
  path: string
  name: string
  componentKey?: string
  children?: WorkspaceRouteStructure[]
}

/** 接口返回的菜单展示信息 */
export type WorkspaceMenuApiItem = {
  name: string
  title: string
  icon?: string
  menuType: MenuTypeEnum
  isVisible: boolean
  isKeepAlive?: boolean
  affix?: boolean
  defaultShow?: boolean
  /** 菜单排序，值越小越靠前 */
  sort?: number
  isExternalPage?: boolean
  openMode?: PageOpenModeEnum
  link?: string
  children?: WorkspaceMenuApiItem[]
}

/** 合并后的完整菜单/路由配置 */
export type WorkspaceRouteConfig = WorkspaceRouteStructure & {
  title: string
  icon?: string
  menuType: MenuTypeEnum
  isVisible: boolean
  isKeepAlive?: boolean
  affix?: boolean
  defaultShow?: boolean
  /** 菜单排序，值越小越靠前 */
  sort?: number
  isExternalPage?: boolean
  openMode?: PageOpenModeEnum
  link?: string
}

export const WORKSPACE_ROUTE_STRUCTURES: WorkspaceRouteStructure[] = [
  {
    path: 'dashboard-catalog',
    name: 'DashboardCatalog',
    children: [
      {
        path: 'data-report',
        name: 'DataReport',
        componentKey: 'DataReport',
      },
      {
        path: 'analysis',
        name: 'Analysis',
        componentKey: 'Analysis',
      },
    ],
  },
  {
    path: 'mixture-demo-catalog',
    name: 'MixtureDemoCatalog',
    children: [
      {
        path: 'mixture-back-demo',
        name: 'MixtureBackDemo',
        componentKey: 'MixtureBackDemo',
      },
    ],
  },
]

/** @deprecated 使用 WORKSPACE_ROUTE_STRUCTURES */
export const WORKSPACE_ROUTE_CONFIGS = WORKSPACE_ROUTE_STRUCTURES

/** 展平后的叶子路由，fullPath 为相对 Home 的完整 path 段 */
export type WorkspaceRouteLeaf = WorkspaceRouteConfig & {
  fullPath: string
}

/**
 * 计算目录节点向下传递的 path 前缀。
 * 顶层目录（如 DashboardCatalog）不参与 URL，子级从空前缀开始。
 */
function buildChildParentPath(
  config: WorkspaceRouteStructure,
  parentPath: string,
  isRootLevel: boolean,
): string {
  if (isRootLevel) {
    return ''
  }
  return parentPath ? `${parentPath}/${config.path}` : config.path
}

/** 计算叶子节点相对 Home 的完整 path 段 */
export function resolveWorkspaceRouteFullPath(
  config: WorkspaceRouteStructure,
  parentPath = '',
): string {
  return parentPath ? `${parentPath}/${config.path}` : config.path
}

export function flattenWorkspaceRouteConfigs(
  configs: WorkspaceRouteConfig[],
  parentPath = '',
  isRootLevel = true,
): WorkspaceRouteLeaf[] {
  return configs.flatMap((config) => {
    if (config.children?.length) {
      const nextParentPath = buildChildParentPath(config, parentPath, isRootLevel)
      const childRoutes = flattenWorkspaceRouteConfigs(config.children, nextParentPath, false)
      const selfRoute = config.componentKey != null
        ? [{
            ...config,
            fullPath: resolveWorkspaceRouteFullPath(config, parentPath),
          }]
        : []
      return [...selfRoute, ...childRoutes]
    }

    return [{
      ...config,
      fullPath: resolveWorkspaceRouteFullPath(config, parentPath),
    }]
  })
}

function withDefaultTitle(structure: WorkspaceRouteStructure): WorkspaceRouteConfig {
  return {
    ...structure,
    title: structure.name,
    menuType: structure.children?.length ? MenuTypeEnum.DIRECTORY : MenuTypeEnum.MENU,
    isVisible: true,
    children: structure.children?.map(withDefaultTitle),
  }
}

/** 本地开发时将路由结构转为带默认 title 的配置 */
export function toWorkspaceRouteConfigs(
  structures: WorkspaceRouteStructure[] = WORKSPACE_ROUTE_STRUCTURES,
): WorkspaceRouteConfig[] {
  return structures.map(withDefaultTitle)
}
