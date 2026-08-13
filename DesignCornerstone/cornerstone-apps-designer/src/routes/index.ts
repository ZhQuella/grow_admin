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
  LowcodeAssetManage: () =>
    import('../pages/lowcode-asset-manage/manage/lowcode-asset-manage.vue'),
  LowcodeAssetDesign: () =>
    import('../pages/lowcode-asset-manage/design/lowcode-asset-design.vue'),
  ReportAssetManage: () =>
    import('../pages/report-asset-manage/manage/report-asset-manage.vue'),
  ReportAssetDesign: () =>
    import('../pages/report-asset-manage/design/report-asset-design.vue'),
  SchemaDesignerPlayground: () =>
    import('../pages/schema-designer-playground/schema-designer-playground.vue'),
  DataPrepPlayground: () =>
    import('../pages/data-prep-playground/data-prep-playground.vue'),
  DataCleanPlayground: () =>
    import('../pages/data-clean-playground/data-clean-playground.vue'),
  ProcessEnginePlayground: () =>
    import('../pages/process-engine-playground/process-engine-playground.vue'),
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
  const designParentByName: Record<string, string> = {
    LowcodeAssetDesign: 'LowcodeAssetManage',
    ReportAssetDesign: 'ReportAssetManage',
  }
  const breadcrumbParentName = designParentByName[config.name]
  return {
    path: fullPath,
    name: config.name,
    component: resolveDesignerComponent(config),
    meta: {
      title: config.title,
      ...(breadcrumbParentName
        ? {
            dynamicTab: true,
            breadcrumbParentName,
          }
        : {}),
    },
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
