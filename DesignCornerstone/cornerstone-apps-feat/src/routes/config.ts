import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'

/** 可序列化路由结构：path 与行为配置，不含展示信息和组件 */
export type FeatRouteStructure = {
  path: string
  name: string
  component?: GrowRouteComponent
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
          },
          {
            path: 'shared-demo-b',
            name: 'SharedDemoB',
          },
        ],
      },
      {
        path: 'open-subpage',
        name: 'OpenSubpage',
      },
      {
        path: 'menu-child-test',
        name: 'MenuChildTest',
        children: [
          {
            path: 'menu-child-test-sub',
            name: 'MenuChildTestSub',
          },
        ],
      },
      {
        path: 'split-pane',
        name: 'SplitPane',
      },
      {
        path: 'down-excel',
        name: 'DownExcel',
      },
      {
        path: 'search-bar',
        name: 'SearchBar',
      },
      {
        path: 'column-bar',
        name: 'ColumnBar',
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
      },
    ],
  },
]

/** 展平后的叶子路由，fullPath 为相对 Home 的完整 path 段 */
export type FeatRouteLeaf = FeatRouteConfig & {
  fullPath: string
}

function buildChildParentPath(
  config: FeatRouteConfig,
  parentPath: string,
): string {
  return config.menuType === MenuTypeEnum.DIRECTORY
    ? parentPath
    : resolveFeatRouteFullPath(config, parentPath)
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
): FeatRouteLeaf[] {
  return configs.flatMap((config) => {
    const selfRoute = config.menuType === MenuTypeEnum.MENU
      ? [{
          ...config,
          fullPath: resolveFeatRouteFullPath(config, parentPath),
        }]
      : []

    if (config.children?.length) {
      const nextParentPath = buildChildParentPath(config, parentPath)
      const childRoutes = flattenFeatRouteConfigs(config.children as FeatRouteConfig[], nextParentPath)
      return [...selfRoute, ...childRoutes]
    }

    return selfRoute
  })
}
