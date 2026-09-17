import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'

/** 可序列化路由结构：path 与行为配置，不含展示信息和组件 */
export type SandboxRouteStructure = {
  path: string
  name: string
  component?: GrowRouteComponent
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
        path: 'code-sandbox-demo',
        name: 'CodeSandboxDemo',
      },
      {
        path: 'code-editor-demo',
        name: 'CodeEditorDemo',
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
    const selfRoute = config.menuType === MenuTypeEnum.MENU
      ? [{
          ...config,
          fullPath: resolveSandboxRouteFullPath(config, parentPath),
        }]
      : []

    if (config.children?.length) {
      const nextParentPath = buildChildParentPath(config, parentPath, isRootLevel)
      const childRoutes = flattenSandboxRouteConfigs(config.children as SandboxRouteConfig[], nextParentPath, false)
      return [...selfRoute, ...childRoutes]
    }

    return selfRoute
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
