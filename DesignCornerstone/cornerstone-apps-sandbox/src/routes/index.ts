import { MenuTypeEnum } from '@grow-admin-rock/constants'
import {
  SANDBOX_ROUTE_STRUCTURES,
  flattenSandboxRouteConfigs,
  type SandboxRouteConfig,
  type SandboxRouteStructure,
} from './config'
import { toSandboxRouteConfigsFromMenu } from './mergeMenu'

export type {
  SandboxRouteConfig,
  SandboxRouteLeaf,
  SandboxRouteStructure,
  SandboxMenuApiItem,
} from './config'
export {
  SANDBOX_ROUTE_STRUCTURES,
  flattenSandboxRouteConfigs,
  resolveSandboxRouteFullPath,
  toSandboxRouteConfigs,
} from './config'
export { SANDBOX_MENU_LIST } from './menuList'
export {
  mergeSandboxMenuWithStructure,
  toSandboxRouteConfigsFromMenu,
} from './mergeMenu'

const SANDBOX_ROUTE_COMPONENTS: Record<string, GrowRouteComponent> = {
  CodeSandboxDemo: () => import('../pages/code-sandbox-demo/code-sandbox-demo.vue'),
  CodeEditorDemo: () => import('../pages/code-editor-demo/code-editor-demo.vue'),
}

function bindSandboxRouteComponents(
  structures: SandboxRouteStructure[],
): SandboxRouteStructure[] {
  return structures.map((structure) => ({
    ...structure,
    component: SANDBOX_ROUTE_COMPONENTS[structure.name],
    children: structure.children?.length
      ? bindSandboxRouteComponents(structure.children)
      : structure.children,
  }))
}

export const SANDBOX_CLIENT_ROUTE_STRUCTURES = bindSandboxRouteComponents(
  SANDBOX_ROUTE_STRUCTURES,
)

function resolveSandboxComponent(config: SandboxRouteConfig): GrowRouteComponent {
  if (!config.component) {
    throw new Error(`Sandbox route "${String(config.name)}" is missing its component`)
  }
  return config.component
}

export const SANDBOX_ROUTES: RouteRecordItem[] = flattenSandboxRouteConfigs(
  toSandboxRouteConfigsFromMenu(undefined, SANDBOX_CLIENT_ROUTE_STRUCTURES),
).map(({ fullPath, ...config }) => resolveSandboxRoute(config, fullPath))

export function resolveSandboxRoute(
  config: SandboxRouteConfig,
  fullPath = config.path,
): RouteRecordItem {
  return {
    path: fullPath,
    name: config.name,
    component: resolveSandboxComponent(config),
    meta: { title: config.title },
    icon: config.icon,
  }
}

export function toSandboxRouteConfig(route: RouteRecordItem): SandboxRouteConfig {
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
