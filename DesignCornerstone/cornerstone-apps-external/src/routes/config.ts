import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'

/** 可序列化路由结构：path 与行为配置，不含展示信息和组件 */
export type ExternalRouteStructure = {
  path: string
  name: string
  children?: ExternalRouteStructure[]
}

/** 接口返回的菜单展示信息 */
export type ExternalMenuApiItem = {
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
  children?: ExternalMenuApiItem[]
}

/** 合并后的完整菜单/路由配置 */
export type ExternalRouteConfig = ExternalRouteStructure & {
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

export const EXTERNAL_ROUTE_STRUCTURES: ExternalRouteStructure[] = [
  {
    path: 'external-pages',
    name: 'ExternalPages',
    children: [
      {
        path: 'element-plus-doc',
        name: 'ElementPlusDoc',
      },
      {
        path: 'grow-admin-doc',
        name: 'GrowAdminDoc',
      },
      {
        path: 'component-document',
        name: 'ComponentDocument',
      },
    ],
  },
]

/** 展平后的叶子路由，fullPath 为相对 Home 的完整 path 段 */
export type ExternalRouteLeaf = ExternalRouteConfig & {
  fullPath: string
}

function buildChildParentPath(
  config: ExternalRouteConfig,
  parentPath: string,
): string {
  return config.menuType === MenuTypeEnum.DIRECTORY
    ? parentPath
    : resolveExternalRouteFullPath(config, parentPath)
}

export function resolveExternalRouteFullPath(
  config: ExternalRouteStructure,
  parentPath = '',
): string {
  return parentPath ? `${parentPath}/${config.path}` : config.path
}

export function flattenExternalRouteConfigs(
  configs: ExternalRouteConfig[],
  parentPath = '',
): ExternalRouteLeaf[] {
  return configs.flatMap((config) => {
    const selfRoute = config.menuType === MenuTypeEnum.MENU
      ? [{
          ...config,
          fullPath: resolveExternalRouteFullPath(config, parentPath),
        }]
      : []

    if (config.children?.length) {
      const nextParentPath = buildChildParentPath(config, parentPath)
      const childRoutes = flattenExternalRouteConfigs(config.children as ExternalRouteConfig[], nextParentPath)
      return [...selfRoute, ...childRoutes]
    }

    return selfRoute
  })
}

function withDefaultTitle(structure: ExternalRouteStructure): ExternalRouteConfig {
  return {
    ...structure,
    title: structure.name,
    menuType: structure.children?.length ? MenuTypeEnum.DIRECTORY : MenuTypeEnum.MENU,
    isVisible: true,
    children: structure.children?.map(withDefaultTitle),
  }
}

/** 本地开发时将路由结构转为带默认 title 的配置 */
export function toExternalRouteConfigs(
  structures: ExternalRouteStructure[] = EXTERNAL_ROUTE_STRUCTURES,
): ExternalRouteConfig[] {
  return structures.map(withDefaultTitle)
}
