import { MenuTypeEnum } from '@grow-admin-rock/constants'
import {
  flattenSandboxRouteConfigs,
  type SandboxRouteConfig,
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
  SANDBOX_COMPONENT_KEYS,
  SANDBOX_COMPONENT_PAGE_NAMES,
  flattenSandboxRouteConfigs,
  isSandboxRouteConfig,
  resolveSandboxPageComponentName,
  resolveSandboxRouteFullPath,
  toSandboxRouteConfigs,
} from './config'
export { SANDBOX_MENU_LIST } from './menuList'
export {
  mergeSandboxMenuWithStructure,
  toSandboxRouteConfigsFromMenu,
} from './mergeMenu'

const SANDBOX_COMPONENTS: Record<string, GrowRouteComponent> = {
  SandboxOverview: () => import('../pages/sandbox-overview/sandbox-overview.vue'),
}

function resolveSandboxComponent(config: SandboxRouteConfig): GrowRouteComponent {
  const componentKey = String(config.componentKey ?? config.name)
  const component = SANDBOX_COMPONENTS[componentKey]
  if (!component) {
    throw new Error(`Unknown sandbox component: ${componentKey}`)
  }
  return component
}

export const SANDBOX_ROUTES: RouteRecordItem[] = flattenSandboxRouteConfigs(
  toSandboxRouteConfigsFromMenu(),
).map(({ fullPath, ...config }) => ({
  ...config,
  path: fullPath,
  component: resolveSandboxComponent(config),
}))

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
