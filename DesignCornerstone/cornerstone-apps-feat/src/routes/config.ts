import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'

/** 客户端路由结构：path、组件映射，不含展示信息 */
export type FeatRouteStructure = {
  path: string
  name: string
  componentKey?: string
  children?: FeatRouteStructure[]
}

/** 接口返回的菜单展示信息 */
export type FeatMenuApiItem = {
  name: string
  title: string
  icon?: string
  menuType: MenuTypeEnum
  isVisible: boolean
  isKeepAlive?: boolean
  affix?: boolean
  defaultShow?: boolean
  isExternalPage?: boolean
  openMode?: PageOpenModeEnum
  link?: string
  children?: FeatMenuApiItem[]
}

/** 合并后的完整菜单/路由配置 */
export type FeatRouteConfig = FeatRouteStructure & {
  title: string
  icon?: string
  menuType: MenuTypeEnum
  isVisible: boolean
  isKeepAlive?: boolean
  affix?: boolean
  defaultShow?: boolean
  isExternalPage?: boolean
  openMode?: PageOpenModeEnum
  link?: string
}

export const FEAT_ROUTE_STRUCTURES: FeatRouteStructure[] = [
  {
    path: 'feat-catalog',
    name: 'FeatCatalog',
    children: [
      {
        path: 'open-subpage',
        name: 'OpenSubpage',
        componentKey: 'OpenSubpage',
      },
      {
        path: 'menu-child-test',
        name: 'MenuChildTest',
        componentKey: 'MenuChildTest',
        children: [
          {
            path: 'menu-child-test-sub',
            name: 'MenuChildTestSub',
            componentKey: 'MenuChildTestSub',
          },
        ],
      },
    ],
  },
]

/** 展平后的叶子路由，fullPath 为相对 Home 的完整 path 段 */
export type FeatRouteLeaf = FeatRouteConfig & {
  fullPath: string
}

function buildChildParentPath(
  config: FeatRouteStructure,
  parentPath: string,
  isRootLevel: boolean,
): string {
  if (isRootLevel) {
    return ''
  }
  return parentPath ? `${parentPath}/${config.path}` : config.path
}

export function resolveFeatRouteFullPath(
  config: FeatRouteStructure,
  parentPath = '',
): string {
  return parentPath ? `${parentPath}/${config.path}` : config.path
}

export function flattenFeatRouteConfigs(
  configs: FeatRouteConfig[],
  parentPath = '',
  isRootLevel = true,
): FeatRouteLeaf[] {
  return configs.flatMap((config) => {
    if (config.children?.length) {
      const nextParentPath = buildChildParentPath(config, parentPath, isRootLevel)
      const childRoutes = flattenFeatRouteConfigs(config.children, nextParentPath, false)
      const selfRoute = config.componentKey != null
        ? [{
            ...config,
            fullPath: resolveFeatRouteFullPath(config, parentPath),
          }]
        : []
      return [...selfRoute, ...childRoutes]
    }

    return [{
      ...config,
      fullPath: resolveFeatRouteFullPath(config, parentPath),
    }]
  })
}

function withDefaultTitle(structure: FeatRouteStructure): FeatRouteConfig {
  return {
    ...structure,
    title: structure.name,
    menuType: structure.children?.length ? MenuTypeEnum.DIRECTORY : MenuTypeEnum.MENU,
    isVisible: true,
    children: structure.children?.map(withDefaultTitle),
  }
}

export function toFeatRouteConfigs(
  structures: FeatRouteStructure[] = FEAT_ROUTE_STRUCTURES,
): FeatRouteConfig[] {
  return structures.map(withDefaultTitle)
}

export const FEAT_COMPONENT_KEYS = new Set(['OpenSubpage', 'MenuChildTest', 'MenuChildTestSub'])

export function isFeatRouteConfig(config: { componentKey?: string, name: string | symbol }): boolean {
  const key = String(config.componentKey ?? config.name)
  return FEAT_COMPONENT_KEYS.has(key)
}
