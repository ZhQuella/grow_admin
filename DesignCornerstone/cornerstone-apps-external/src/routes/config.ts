import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'

/** 客户端路由结构：path、组件映射，不含展示信息 */
export type ExternalRouteStructure = {
  path: string
  name: string
  componentKey?: string
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
        componentKey: 'EmbedPage',
      },
      {
        path: 'grow-admin-doc',
        name: 'GrowAdminDoc',
        componentKey: 'EmbedPage',
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
  config: ExternalRouteStructure,
  parentPath: string,
  isRootLevel: boolean,
): string {
  if (isRootLevel) {
    return ''
  }
  return parentPath ? `${parentPath}/${config.path}` : config.path
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
  isRootLevel = true,
): ExternalRouteLeaf[] {
  return configs.flatMap((config) => {
    if (config.children?.length) {
      const nextParentPath = buildChildParentPath(config, parentPath, isRootLevel)
      const childRoutes = flattenExternalRouteConfigs(config.children, nextParentPath, false)
      const selfRoute = config.componentKey != null
        ? [{
            ...config,
            fullPath: resolveExternalRouteFullPath(config, parentPath),
          }]
        : []
      return [...selfRoute, ...childRoutes]
    }

    return [{
      ...config,
      fullPath: resolveExternalRouteFullPath(config, parentPath),
    }]
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
