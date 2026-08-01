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
        path: 'designer-playground',
        name: 'DesignerPlayground',
        componentKey: 'DesignerPlayground',
      },
      {
        path: 'report-designer-playground',
        name: 'ReportDesignerPlayground',
        componentKey: 'ReportDesignerPlayground',
      },
      {
        path: 'schema-designer-playground',
        name: 'SchemaDesignerPlayground',
        componentKey: 'SchemaDesignerPlayground',
      },
      {
        path: 'data-prep-playground',
        name: 'DataPrepPlayground',
        componentKey: 'DataPrepPlayground',
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
  'DesignerPlayground',
  'ReportDesignerPlayground',
  'SchemaDesignerPlayground',
  'DataPrepPlayground',
])

export const DESIGNER_COMPONENT_PAGE_NAMES: Record<string, string> = {
  DesignerPlayground: 'DesignerPlaygroundPage',
  ReportDesignerPlayground: 'ReportDesignerPlaygroundPage',
  SchemaDesignerPlayground: 'SchemaDesignerPlaygroundPage',
  DataPrepPlayground: 'DataPrepPlaygroundPage',
}

export function resolveDesignerPageComponentName(componentKey: string): string {
  return DESIGNER_COMPONENT_PAGE_NAMES[componentKey] ?? componentKey
}

export function isDesignerRouteConfig(config: { componentKey?: string; name: string | symbol }): boolean {
  const key = String(config.componentKey ?? config.name)
  return DESIGNER_COMPONENT_KEYS.has(key)
}
