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
  /** 菜单排序，值越小越靠前 */
  sort?: number
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
  /** 菜单排序，值越小越靠前 */
  sort?: number
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
        path: 'shared-demo',
        name: 'SharedDemo',
        children: [
          {
            path: 'shared-demo-a',
            name: 'SharedDemoA',
            componentKey: 'SharedDemo',
          },
          {
            path: 'shared-demo-b',
            name: 'SharedDemoB',
            componentKey: 'SharedDemo',
          },
        ],
      },
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
      {
        path: 'split-pane',
        name: 'SplitPane',
        componentKey: 'SplitPane',
      },
      {
        path: 'down-excel',
        name: 'DownExcel',
        componentKey: 'DownExcel',
      },
      {
        path: 'search-bar',
        name: 'SearchBar',
        componentKey: 'SearchBar',
      },
      {
        path: 'column-bar',
        name: 'ColumnBar',
        componentKey: 'ColumnBar',
      },
    ],
  },
]

/** 仅前端注册的演示结构（不进入 /menu/list mock；与后端共用 MixtureDemoCatalog） */
export const FEAT_FRONT_ONLY_STRUCTURES: FeatRouteStructure[] = [
  {
    path: 'mixture-demo-catalog',
    name: 'MixtureDemoCatalog',
    children: [
      {
        path: 'mixture-front-demo',
        name: 'MixtureFrontDemo',
        componentKey: 'MixtureFrontDemo',
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

export const FEAT_COMPONENT_KEYS = new Set([
  'OpenSubpage',
  'MenuChildTest',
  'MenuChildTestSub',
  'SharedDemo',
  'SplitPane',
  'DownExcel',
  'SearchBar',
  'ColumnBar',
  'MixtureFrontDemo',
])

/** componentKey 对应的页面组件 name（与 .vue 中 defineOptions.name 一致） */
export const FEAT_COMPONENT_PAGE_NAMES: Record<string, string> = {
  OpenSubpage: 'OpenSubpagePage',
  MenuChildTest: 'MenuChildTestPage',
  MenuChildTestSub: 'MenuChildTestSubPage',
  SharedDemo: 'SharedDemoPage',
  SplitPane: 'SplitPanePage',
  DownExcel: 'DownExcelPage',
  SearchBar: 'SearchBarPage',
  ColumnBar: 'ColumnBarPage',
  MixtureFrontDemo: 'MixtureFrontDemoPage',
}

export function resolveFeatPageComponentName(componentKey: string): string {
  return FEAT_COMPONENT_PAGE_NAMES[componentKey] ?? componentKey
}

export function isFeatRouteConfig(config: { componentKey?: string, name: string | symbol }): boolean {
  const key = String(config.componentKey ?? config.name)
  return FEAT_COMPONENT_KEYS.has(key)
}
