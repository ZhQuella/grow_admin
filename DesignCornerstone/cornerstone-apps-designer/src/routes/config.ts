import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'

export type DesignerRouteStructure = {
  path: string
  name: string
  componentKey?: string
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
        path: 'lowcode-asset-manage',
        name: 'LowcodeAssetManage',
        componentKey: 'LowcodeAssetManage',
        children: [
          {
            path: 'design/:id',
            name: 'LowcodeAssetDesign',
            componentKey: 'LowcodeAssetDesign',
          },
        ],
      },
      {
        path: 'report-asset-manage',
        name: 'ReportAssetManage',
        componentKey: 'ReportAssetManage',
        children: [
          {
            path: 'design/:id',
            name: 'ReportAssetDesign',
            componentKey: 'ReportAssetDesign',
          },
        ],
      },
      {
        path: 'schema-asset-manage',
        name: 'SchemaAssetManage',
        componentKey: 'SchemaAssetManage',
        children: [
          {
            path: 'design/:id',
            name: 'SchemaAssetDesign',
            componentKey: 'SchemaAssetDesign',
          },
        ],
      },
      {
        path: 'data-prep-asset-manage',
        name: 'DataPrepAssetManage',
        componentKey: 'DataPrepAssetManage',
        children: [
          {
            path: 'design/:id',
            name: 'DataPrepAssetDesign',
            componentKey: 'DataPrepAssetDesign',
          },
        ],
      },
      {
        path: 'data-clean-asset-manage',
        name: 'DataCleanAssetManage',
        componentKey: 'DataCleanAssetManage',
        children: [
          {
            path: 'design/:id',
            name: 'DataCleanAssetDesign',
            componentKey: 'DataCleanAssetDesign',
          },
        ],
      },
      {
        path: 'process-asset-manage',
        name: 'ProcessAssetManage',
        componentKey: 'ProcessAssetManage',
        children: [
          {
            path: 'design/:id',
            name: 'ProcessAssetDesign',
            componentKey: 'ProcessAssetDesign',
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
  config: DesignerRouteStructure,
  parentPath: string,
  isRootLevel: boolean,
): string {
  if (isRootLevel) {
    return ''
  }
  return parentPath ? `${parentPath}/${config.path}` : config.path
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
  isRootLevel = true,
): DesignerRouteLeaf[] {
  return configs.flatMap((config) => {
    if (config.children?.length) {
      const nextParentPath = buildChildParentPath(config, parentPath, isRootLevel)
      const childRoutes = flattenDesignerRouteConfigs(config.children, nextParentPath, false)
      const selfRoute = config.componentKey != null
        ? [{
            ...config,
            fullPath: resolveDesignerRouteFullPath(config, parentPath),
          }]
        : []
      return [...selfRoute, ...childRoutes]
    }

    return [{
      ...config,
      fullPath: resolveDesignerRouteFullPath(config, parentPath),
    }]
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

export const DESIGNER_COMPONENT_KEYS = new Set([
  'LowcodeAssetManage',
  'LowcodeAssetDesign',
  'ReportAssetManage',
  'ReportAssetDesign',
  'SchemaAssetManage',
  'SchemaAssetDesign',
  'DataPrepAssetManage',
  'DataPrepAssetDesign',
  'DataCleanAssetManage',
  'DataCleanAssetDesign',
  'ProcessAssetManage',
  'ProcessAssetDesign',
])

export const DESIGNER_COMPONENT_PAGE_NAMES: Record<string, string> = {
  LowcodeAssetManage: 'LowcodeAssetManagePage',
  LowcodeAssetDesign: 'LowcodeAssetDesignPage',
  ReportAssetManage: 'ReportAssetManagePage',
  ReportAssetDesign: 'ReportAssetDesignPage',
  SchemaAssetManage: 'SchemaAssetManagePage',
  SchemaAssetDesign: 'SchemaAssetDesignPage',
  DataPrepAssetManage: 'DataPrepAssetManagePage',
  DataPrepAssetDesign: 'DataPrepAssetDesignPage',
  DataCleanAssetManage: 'DataCleanAssetManagePage',
  DataCleanAssetDesign: 'DataCleanAssetDesignPage',
  ProcessAssetManage: 'ProcessAssetManagePage',
  ProcessAssetDesign: 'ProcessAssetDesignPage',
}

export function resolveDesignerPageComponentName(componentKey: string): string {
  return DESIGNER_COMPONENT_PAGE_NAMES[componentKey] ?? componentKey
}

export function isDesignerRouteConfig(config: { componentKey?: string; name: string | symbol }): boolean {
  const key = String(config.componentKey ?? config.name)
  return DESIGNER_COMPONENT_KEYS.has(key)
}
