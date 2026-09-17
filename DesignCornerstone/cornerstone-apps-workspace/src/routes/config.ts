import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'

/** 可序列化路由结构：path 与行为配置，不含展示信息和组件 */
export type WorkspaceRouteStructure = {
  path: string
  name: string
  component?: GrowRouteComponent
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
      },
      {
        path: 'analysis',
        name: 'Analysis',
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

/** 目录仅用于菜单分组，不参与子级路由 URL。 */
function buildChildParentPath(
  config: WorkspaceRouteConfig,
  parentPath: string,
): string {
  return config.menuType === MenuTypeEnum.DIRECTORY
    ? parentPath
    : resolveWorkspaceRouteFullPath(config, parentPath)
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
): WorkspaceRouteLeaf[] {
  return configs.flatMap((config) => {
    const selfRoute = config.menuType === MenuTypeEnum.MENU
      ? [{
          ...config,
          fullPath: resolveWorkspaceRouteFullPath(config, parentPath),
        }]
      : []

    if (config.children?.length) {
      const nextParentPath = buildChildParentPath(config, parentPath)
      const childRoutes = flattenWorkspaceRouteConfigs(config.children as WorkspaceRouteConfig[], nextParentPath)
      return [...selfRoute, ...childRoutes]
    }

    return selfRoute
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
