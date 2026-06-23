import { MenuTypeEnum } from '@grow-admin-rock/constants'
import {
  flattenFeatRouteConfigs,
  toFeatRouteConfigs,
  type FeatRouteConfig,
} from './config'

export type {
  FeatRouteConfig,
  FeatRouteLeaf,
  FeatRouteStructure,
  FeatMenuApiItem,
} from './config'
export {
  FEAT_ROUTE_STRUCTURES,
  FEAT_COMPONENT_KEYS,
  flattenFeatRouteConfigs,
  isFeatRouteConfig,
  resolveFeatRouteFullPath,
  toFeatRouteConfigs,
} from './config'
export { mergeFeatMenuWithStructure } from './mergeMenu'

const FEAT_COMPONENTS: Record<string, GrowRouteComponent> = {
  OpenSubpage: () => import('../pages/open-subpage.vue'),
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
    component: () => import('../pages/child-page.vue'),
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
