import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'

/** 客户端路由结构：path、组件映射，不含展示信息 */
export type SandboxRouteStructure = {
  path: string
  name: string
  componentKey?: string
  children?: SandboxRouteStructure[]
}

/** 接口返回的菜单展示信息 */
export type SandboxMenuApiItem = {
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
  children?: SandboxMenuApiItem[]
}

/** 合并后的完整菜单/路由配置 */
export type SandboxRouteConfig = SandboxRouteStructure & {
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

export const SANDBOX_ROUTE_STRUCTURES: SandboxRouteStructure[] = [
  {
    path: 'sandbox-catalog',
    name: 'SandboxCatalog',
    children: [
      {
        path: 'sandbox-overview',
        name: 'SandboxOverview',
        componentKey: 'SandboxOverview',
      },
      {
        path: 'code-sandbox-demo',
        name: 'CodeSandboxDemo',
        componentKey: 'CodeSandboxDemo',
      },
      {
        path: 'code-editor-demo',
        name: 'CodeEditorDemo',
        componentKey: 'CodeEditorDemo',
      },
    ],
  },
]

export type SandboxRouteLeaf = SandboxRouteConfig & {
  fullPath: string
}

function buildChildParentPath(
  config: SandboxRouteStructure,
  parentPath: string,
  isRootLevel: boolean,
): string {
  if (isRootLevel) {
    return ''
  }
  return parentPath ? `${parentPath}/${config.path}` : config.path
}

export function resolveSandboxRouteFullPath(
  config: SandboxRouteStructure,
  parentPath = '',
): string {
  return parentPath ? `${parentPath}/${config.path}` : config.path
}

export function flattenSandboxRouteConfigs(
  configs: SandboxRouteConfig[],
  parentPath = '',
  isRootLevel = true,
): SandboxRouteLeaf[] {
  return configs.flatMap((config) => {
    if (config.children?.length) {
      const nextParentPath = buildChildParentPath(config, parentPath, isRootLevel)
      const childRoutes = flattenSandboxRouteConfigs(config.children, nextParentPath, false)
      const selfRoute = config.componentKey != null
        ? [{
            ...config,
            fullPath: resolveSandboxRouteFullPath(config, parentPath),
          }]
        : []
      return [...selfRoute, ...childRoutes]
    }

    return [{
      ...config,
      fullPath: resolveSandboxRouteFullPath(config, parentPath),
    }]
  })
}

function withDefaultTitle(structure: SandboxRouteStructure): SandboxRouteConfig {
  return {
    ...structure,
    title: structure.name,
    menuType: structure.children?.length ? MenuTypeEnum.DIRECTORY : MenuTypeEnum.MENU,
    isVisible: true,
    children: structure.children?.map(withDefaultTitle),
  }
}

export function toSandboxRouteConfigs(
  structures: SandboxRouteStructure[] = SANDBOX_ROUTE_STRUCTURES,
): SandboxRouteConfig[] {
  return structures.map(withDefaultTitle)
}

export const SANDBOX_COMPONENT_KEYS = new Set([
  'SandboxOverview',
  'CodeSandboxDemo',
  'CodeEditorDemo',
])

export const SANDBOX_COMPONENT_PAGE_NAMES: Record<string, string> = {
  SandboxOverview: 'SandboxOverviewPage',
  CodeSandboxDemo: 'CodeSandboxDemoPage',
  CodeEditorDemo: 'CodeEditorDemoPage',
}

export function resolveSandboxPageComponentName(componentKey: string): string {
  return SANDBOX_COMPONENT_PAGE_NAMES[componentKey] ?? componentKey
}

export function isSandboxRouteConfig(config: { componentKey?: string; name: string | symbol }): boolean {
  const key = String(config.componentKey ?? config.name)
  return SANDBOX_COMPONENT_KEYS.has(key)
}
