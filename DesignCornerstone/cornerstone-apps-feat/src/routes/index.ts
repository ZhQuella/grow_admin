import { MenuTypeEnum } from '@grow-admin-rock/constants'
import {
  flattenFeatRouteConfigs,
  type FeatRouteConfig,
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
  FEAT_COMPONENT_KEYS,
  FEAT_COMPONENT_PAGE_NAMES,
  flattenFeatRouteConfigs,
  isFeatRouteConfig,
  resolveFeatPageComponentName,
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

const FEAT_COMPONENTS: Record<string, GrowRouteComponent> = {
  OpenSubpage: () => import('../pages/open-subpage/open-subpage.vue'),
  MenuChildTest: () => import('../pages/menu-child-test/menu-child-test.vue'),
  MenuChildTestSub: () => import('../pages/menu-child-test/menu-child-test-sub.vue'),
  SharedDemo: () => import('../pages/shared-demo/shared-demo.vue'),
  SplitPane: () => import('../pages/split-pane/split-pane.vue'),
  DownExcel: () => import('../pages/down-excel/down-excel.vue'),
  SearchBar: () => import('../pages/search-bar/search-bar.vue'),
  ColumnBar: () => import('../pages/column-bar/column-bar.vue'),
  MixtureFrontDemo: () => import('../pages/mixture-front-demo/mixture-front-demo.vue'),
}

function resolveFeatComponent(config: FeatRouteConfig): GrowRouteComponent {
  const componentKey = String(config.componentKey ?? config.name)
  const component = FEAT_COMPONENTS[componentKey]
  if (!component) {
    throw new Error(`Unknown feat component: ${componentKey}`)
  }
  return component
}

export const FEAT_ROUTES: RouteRecordItem[] = flattenFeatRouteConfigs(
  toFeatRouteConfigs(),
).map(({ fullPath, ...config }) => ({
  ...config,
  path: fullPath,
  component: resolveFeatComponent(config),
}))

/** 不在菜单中注册的隐藏动态路由 */
export const FEAT_HIDDEN_ROUTES: RouteRecordItem[] = [
  {
    path: 'child/:id',
    name: 'Child',
    component: () => import('../pages/open-subpage/child-page.vue'),
    meta: {
      title: '子页面',
      componentName: 'ChildPage',
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
