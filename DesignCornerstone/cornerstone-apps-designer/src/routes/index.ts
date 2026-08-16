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
  SchemaAssetManage: () =>
    import('../pages/schema-asset-manage/manage/schema-asset-manage.vue'),
  SchemaAssetDesign: () =>
    import('../pages/schema-asset-manage/design/schema-asset-design.vue'),
  DataPrepAssetManage: () =>
    import('../pages/data-prep-asset-manage/manage/data-prep-asset-manage.vue'),
  DataPrepAssetDesign: () =>
    import('../pages/data-prep-asset-manage/design/data-prep-asset-design.vue'),
  DataCleanAssetManage: () =>
    import('../pages/data-clean-asset-manage/manage/data-clean-asset-manage.vue'),
  DataCleanAssetDesign: () =>
    import('../pages/data-clean-asset-manage/design/data-clean-asset-design.vue'),
  ProcessAssetManage: () =>
    import('../pages/process-asset-manage/manage/process-asset-manage.vue'),
  ProcessAssetDesign: () =>
    import('../pages/process-asset-manage/design/process-asset-design.vue'),
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
    SchemaAssetDesign: 'SchemaAssetManage',
    DataPrepAssetDesign: 'DataPrepAssetManage',
    DataCleanAssetDesign: 'DataCleanAssetManage',
    ProcessAssetDesign: 'ProcessAssetManage',
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
