import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'

export type DesignerRouteStructure = {
  path: string
  name: string
  component?: GrowRouteComponent
  dynamicTab?: boolean
  breadcrumbParentName?: string
  children?: DesignerRouteStructure[]
}

export type DesignerMenuApiItem = {
  name: string
  title: string
  icon?: string
  menuType: MenuTypeEnum
  isVisible: boolean
  isKeepAlive?: boolean
  affix?: boolean
  defaultShow?: boolean
  sort?: number
  isExternalPage?: boolean
  openMode?: PageOpenModeEnum
  link?: string
  children?: DesignerMenuApiItem[]
}

export type DesignerRouteConfig = DesignerRouteStructure & {
  title: string
  icon?: string
  menuType: MenuTypeEnum
  isVisible: boolean
  isKeepAlive?: boolean
  affix?: boolean
  defaultShow?: boolean
  sort?: number
  isExternalPage?: boolean
  openMode?: PageOpenModeEnum
  link?: string
}

export const DESIGNER_ROUTE_STRUCTURES: DesignerRouteStructure[] = [
  {
    path: 'designer-catalog',
    name: 'DesignerCatalog',
    children: [
      {
        path: 'online-page-manage',
        name: 'OnlinePageManage',
        children: [
          {
            path: 'design/:id',
            name: 'OnlinePageDesign',
            dynamicTab: true,
            breadcrumbParentName: 'OnlinePageManage',
          },
        ],
      },
      {
        path: 'lowcode-asset-manage',
        name: 'LowcodeAssetManage',
        children: [
          {
            path: 'design/:id',
            name: 'LowcodeAssetDesign',
            dynamicTab: true,
            breadcrumbParentName: 'LowcodeAssetManage',
          },
        ],
      },
      {
        path: 'report-asset-manage',
        name: 'ReportAssetManage',
        children: [
          {
            path: 'design/:id',
            name: 'ReportAssetDesign',
            dynamicTab: true,
            breadcrumbParentName: 'ReportAssetManage',
          },
        ],
      },
      {
        path: 'schema-asset-manage',
        name: 'SchemaAssetManage',
        children: [
          {
            path: 'design/:id',
            name: 'SchemaAssetDesign',
            dynamicTab: true,
            breadcrumbParentName: 'SchemaAssetManage',
          },
        ],
      },
      {
        path: 'data-prep-asset-manage',
        name: 'DataPrepAssetManage',
        children: [
          {
            path: 'design/:id',
            name: 'DataPrepAssetDesign',
            dynamicTab: true,
            breadcrumbParentName: 'DataPrepAssetManage',
          },
        ],
      },
      {
        path: 'data-clean-asset-manage',
        name: 'DataCleanAssetManage',
        children: [
          {
            path: 'design/:id',
            name: 'DataCleanAssetDesign',
            dynamicTab: true,
            breadcrumbParentName: 'DataCleanAssetManage',
          },
        ],
      },
      {
        path: 'process-asset-manage',
        name: 'ProcessAssetManage',
        children: [
          {
            path: 'design/:id',
            name: 'ProcessAssetDesign',
            dynamicTab: true,
            breadcrumbParentName: 'ProcessAssetManage',
          },
        ],
      },
    ],
  },
]

export type DesignerRouteLeaf = DesignerRouteConfig & {
  fullPath: string
}

function buildChildParentPath(
  config: DesignerRouteConfig,
  parentPath: string,
): string {
  return config.menuType === MenuTypeEnum.DIRECTORY
    ? parentPath
    : resolveDesignerRouteFullPath(config, parentPath)
}

export function resolveDesignerRouteFullPath(
  config: DesignerRouteStructure,
  parentPath = '',
): string {
  return parentPath ? `${parentPath}/${config.path}` : config.path
}

export function flattenDesignerRouteConfigs(
  configs: DesignerRouteConfig[],
  parentPath = '',
): DesignerRouteLeaf[] {
  return configs.flatMap((config) => {
    const selfRoute = config.menuType === MenuTypeEnum.MENU
      ? [{
          ...config,
          fullPath: resolveDesignerRouteFullPath(config, parentPath),
        }]
      : []

    if (config.children?.length) {
      const nextParentPath = buildChildParentPath(config, parentPath)
      const childRoutes = flattenDesignerRouteConfigs(config.children as DesignerRouteConfig[], nextParentPath)
      return [...selfRoute, ...childRoutes]
    }

    return selfRoute
  })
}

function withDefaultTitle(structure: DesignerRouteStructure): DesignerRouteConfig {
  return {
    ...structure,
    title: structure.name,
    menuType: structure.children?.length ? MenuTypeEnum.DIRECTORY : MenuTypeEnum.MENU,
    isVisible: true,
    children: structure.children?.map(withDefaultTitle),
  }
}

export function toDesignerRouteConfigs(
  structures: DesignerRouteStructure[] = DESIGNER_ROUTE_STRUCTURES,
): DesignerRouteConfig[] {
  return structures.map(withDefaultTitle)
}
