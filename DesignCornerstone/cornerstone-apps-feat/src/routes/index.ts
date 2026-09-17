import { MenuTypeEnum } from '@grow-admin-rock/constants'
import {
  FEAT_FRONT_ONLY_STRUCTURES,
  FEAT_ROUTE_STRUCTURES,
  flattenFeatRouteConfigs,
  type FeatRouteConfig,
  type FeatRouteStructure,
} from './config'
import { toFeatRouteConfigs } from './mergeMenu'

export type {
  FeatRouteConfig,
  FeatRouteLeaf,
  FeatRouteStructure,
  FeatMenuApiItem,
} from './config'
export {
  FEAT_ROUTE_STRUCTURES,
  FEAT_FRONT_ONLY_STRUCTURES,
  flattenFeatRouteConfigs,
  resolveFeatRouteFullPath,
} from './config'
export { FEAT_MENU_LIST, FEAT_FRONT_ONLY_MENU_LIST } from './menuList'
export {
  FEAT_ROUTE_AUTHORITY,
  canAccessRouteByRoles,
  filterConfigsByRoles,
  hasCommonElement,
} from './authority'
export { mergeFeatMenuWithStructure, toFeatRouteConfigs } from './mergeMenu'

const FEAT_ROUTE_COMPONENTS: Record<string, GrowRouteComponent> = {
  SharedDemoA: () => import('../pages/shared-demo/shared-demo.vue'),
  SharedDemoB: () => import('../pages/shared-demo/shared-demo.vue'),
  OpenSubpage: () => import('../pages/open-subpage/open-subpage.vue'),
  MenuChildTest: () => import('../pages/menu-child-test/menu-child-test.vue'),
  MenuChildTestSub: () => import('../pages/menu-child-test/menu-child-test-sub.vue'),
  SplitPane: () => import('../pages/split-pane/split-pane.vue'),
  DownExcel: () => import('../pages/down-excel/down-excel.vue'),
  SearchBar: () => import('../pages/search-bar/search-bar.vue'),
  ColumnBar: () => import('../pages/column-bar/column-bar.vue'),
  MixtureFrontDemo: () => import('../pages/mixture-front-demo/mixture-front-demo.vue'),
}

function bindFeatRouteComponents(structures: FeatRouteStructure[]): FeatRouteStructure[] {
  return structures.map((structure) => ({
    ...structure,
    component: FEAT_ROUTE_COMPONENTS[structure.name],
    children: structure.children?.length
      ? bindFeatRouteComponents(structure.children)
      : structure.children,
  }))
}

export const FEAT_CLIENT_ROUTE_STRUCTURES = bindFeatRouteComponents(FEAT_ROUTE_STRUCTURES)
export const FEAT_FRONT_ONLY_CLIENT_STRUCTURES = bindFeatRouteComponents(FEAT_FRONT_ONLY_STRUCTURES)

function resolveFeatComponent(config: FeatRouteConfig): GrowRouteComponent {
  if (!config.component) {
    throw new Error(`Feat route "${String(config.name)}" is missing its component`)
  }
  return config.component
}

export const FEAT_ROUTES: RouteRecordItem[] = flattenFeatRouteConfigs(
  toFeatRouteConfigs(undefined, [
    ...FEAT_CLIENT_ROUTE_STRUCTURES,
    ...FEAT_FRONT_ONLY_CLIENT_STRUCTURES,
  ]),
).map(({ fullPath, ...config }) => resolveFeatRoute(config, fullPath))

/** 不在菜单中注册的隐藏动态路由 */
export const FEAT_HIDDEN_ROUTES: RouteRecordItem[] = [
  {
    path: 'child/:id',
    name: 'Child',
    component: () => import('../pages/open-subpage/child-page.vue'),
    meta: {
      title: '子页面',
      isKeepAlive: true,
      dynamicTab: true,
      breadcrumbParentName: 'OpenSubpage',
    },
  },
]

export function toFeatRouteConfig(route: RouteRecordItem): FeatRouteConfig {
  const { path, name, meta, icon } = route
  return {
    path,
    name,
    title: String(meta?.title ?? name),
    icon,
    menuType: MenuTypeEnum.MENU,
    isVisible: true,
  }
}

export function resolveFeatRoute(
  config: FeatRouteConfig,
  fullPath = config.path,
): RouteRecordItem {
  return {
    path: fullPath,
    name: config.name,
    component: resolveFeatComponent(config),
    meta: { title: config.title },
    icon: config.icon,
  }
}
