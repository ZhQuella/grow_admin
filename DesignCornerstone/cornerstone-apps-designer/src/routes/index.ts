import { MenuTypeEnum } from '@grow-admin-rock/constants'
import {
  flattenDesignerRouteConfigs,
  type DesignerRouteConfig,
} from './config'
import { toDesignerRouteConfigsFromMenu } from './mergeMenu'

export type {
  DesignerRouteConfig,
  DesignerRouteLeaf,
  DesignerRouteStructure,
  DesignerMenuApiItem,
} from './config'
export {
  DESIGNER_ROUTE_STRUCTURES,
  DESIGNER_COMPONENT_KEYS,
  DESIGNER_COMPONENT_PAGE_NAMES,
  flattenDesignerRouteConfigs,
  isDesignerRouteConfig,
  resolveDesignerPageComponentName,
  resolveDesignerRouteFullPath,
  toDesignerRouteConfigs,
} from './config'
export { DESIGNER_MENU_LIST } from './menuList'
export {
  mergeDesignerMenuWithStructure,
  toDesignerRouteConfigsFromMenu,
} from './mergeMenu'

const DESIGNER_COMPONENTS: Record<string, GrowRouteComponent> = {
  DesignerPlayground: () => import('../pages/designer-playground/designer-playground.vue'),
  ReportDesignerPlayground: () =>
    import('../pages/report-designer-playground/report-designer-playground.vue'),
  SchemaDesignerPlayground: () =>
    import('../pages/schema-designer-playground/schema-designer-playground.vue'),
}

function resolveDesignerComponent(config: DesignerRouteConfig): GrowRouteComponent {
  const componentKey = String(config.componentKey ?? config.name)
  const component = DESIGNER_COMPONENTS[componentKey]
  if (!component) {
    throw new Error(`Unknown designer component: ${componentKey}`)
  }
  return component
}

export const DESIGNER_ROUTES: RouteRecordItem[] = flattenDesignerRouteConfigs(
  toDesignerRouteConfigsFromMenu(),
).map(({ fullPath, ...config }) => ({
  ...config,
  path: fullPath,
  component: resolveDesignerComponent(config),
}))

export function resolveDesignerRoute(
  config: DesignerRouteConfig,
  fullPath = config.path,
): RouteRecordItem {
  return {
    path: fullPath,
    name: config.name,
    component: resolveDesignerComponent(config),
    meta: { title: config.title },
    icon: config.icon,
  }
}

export function toDesignerRouteConfig(route: RouteRecordItem): DesignerRouteConfig {
  const { path, name, meta, icon } = route
  return {
    path,
    name: String(name),
    title: String(meta?.title ?? name),
    icon,
    menuType: MenuTypeEnum.MENU,
    isVisible: true,
  }
}
