import { MenuTypeEnum } from '@grow-admin-rock/constants'
import {
  DESIGNER_ROUTE_STRUCTURES,
  flattenDesignerRouteConfigs,
  type DesignerRouteConfig,
  type DesignerRouteStructure,
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
  flattenDesignerRouteConfigs,
  resolveDesignerRouteFullPath,
  toDesignerRouteConfigs,
} from './config'
export { DESIGNER_MENU_LIST } from './menuList'
export {
  mergeDesignerMenuWithStructure,
  toDesignerRouteConfigsFromMenu,
} from './mergeMenu'

const DESIGNER_ROUTE_COMPONENTS: Record<string, GrowRouteComponent> = {
  OnlinePageManage: () => import('../pages/online-page-manage/manage/online-page-manage.vue'),
  OnlinePageDesign: () => import('../pages/online-page-manage/design/online-page-design.vue'),
  LowcodeAssetManage: () => import('../pages/lowcode-asset-manage/manage/lowcode-asset-manage.vue'),
  LowcodeAssetDesign: () => import('../pages/lowcode-asset-manage/design/lowcode-asset-design.vue'),
  ReportAssetManage: () => import('../pages/report-asset-manage/manage/report-asset-manage.vue'),
  ReportAssetDesign: () => import('../pages/report-asset-manage/design/report-asset-design.vue'),
  SchemaAssetManage: () => import('../pages/schema-asset-manage/manage/schema-asset-manage.vue'),
  SchemaAssetDesign: () => import('../pages/schema-asset-manage/design/schema-asset-design.vue'),
  DataPrepAssetManage: () => import('../pages/data-prep-asset-manage/manage/data-prep-asset-manage.vue'),
  DataPrepAssetDesign: () => import('../pages/data-prep-asset-manage/design/data-prep-asset-design.vue'),
  DataCleanAssetManage: () => import('../pages/data-clean-asset-manage/manage/data-clean-asset-manage.vue'),
  DataCleanAssetDesign: () => import('../pages/data-clean-asset-manage/design/data-clean-asset-design.vue'),
  ProcessAssetManage: () => import('../pages/process-asset-manage/manage/process-asset-manage.vue'),
  ProcessAssetDesign: () => import('../pages/process-asset-manage/design/process-asset-design.vue'),
}

function bindDesignerRouteComponents(
  structures: DesignerRouteStructure[],
): DesignerRouteStructure[] {
  return structures.map((structure) => ({
    ...structure,
    component: DESIGNER_ROUTE_COMPONENTS[structure.name],
    children: structure.children?.length
      ? bindDesignerRouteComponents(structure.children)
      : structure.children,
  }))
}

export const DESIGNER_CLIENT_ROUTE_STRUCTURES = bindDesignerRouteComponents(
  DESIGNER_ROUTE_STRUCTURES,
)

function resolveDesignerComponent(config: DesignerRouteConfig): GrowRouteComponent {
  if (!config.component) {
    throw new Error(`Designer route "${String(config.name)}" is missing its component`)
  }
  return config.component
}

export const DESIGNER_ROUTES: RouteRecordItem[] = flattenDesignerRouteConfigs(
  toDesignerRouteConfigsFromMenu(undefined, DESIGNER_CLIENT_ROUTE_STRUCTURES),
).map(({ fullPath, ...config }) => resolveDesignerRoute(config, fullPath))

export function resolveDesignerRoute(
  config: DesignerRouteConfig,
  fullPath = config.path,
): RouteRecordItem {
  return {
    path: fullPath,
    name: config.name,
    component: resolveDesignerComponent(config),
    meta: {
      title: config.title,
      ...(config.breadcrumbParentName
        ? {
            dynamicTab: config.dynamicTab,
            breadcrumbParentName: config.breadcrumbParentName,
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
