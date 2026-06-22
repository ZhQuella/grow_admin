import { MenuTypeEnum } from '@grow-admin-rock/constants'
import {
  flattenWorkspaceRouteConfigs,
  toWorkspaceRouteConfigs,
  type WorkspaceRouteConfig,
} from './config'

export type {
  WorkspaceRouteConfig,
  WorkspaceRouteLeaf,
  WorkspaceRouteStructure,
  WorkspaceMenuApiItem,
} from './config'
export {
  WORKSPACE_ROUTE_STRUCTURES,
  WORKSPACE_ROUTE_CONFIGS,
  flattenWorkspaceRouteConfigs,
  resolveWorkspaceRouteFullPath,
  toWorkspaceRouteConfigs,
} from './config'
export { mergeMenuWithStructure } from './mergeMenu'

const WORKSPACE_COMPONENTS: Record<string, GrowRouteComponent> = {
  Workspace: () => import('../pages/workspace.vue'),
  WorkspaceSettings: () => import('../pages/settings.vue'),
  SharedDemo: () => import('../pages/shared-demo.vue'),
  MenuChildTest: () => import('../pages/menu-child-test.vue'),
  MenuChildTestSub: () => import('../pages/menu-child-test-sub.vue'),
}

function resolveWorkspaceComponent(config: WorkspaceRouteConfig): GrowRouteComponent {
  const componentKey = String(config.componentKey ?? config.name)
  const component = WORKSPACE_COMPONENTS[componentKey]
  if (!component) {
    throw new Error(`Unknown workspace component: ${componentKey}`)
  }
  return component
}

export const WORKSPACE_ROUTES: RouteRecordItem[] = flattenWorkspaceRouteConfigs(
  toWorkspaceRouteConfigs(),
).map(({ fullPath, ...config }) => ({
  ...config,
  path: fullPath,
  component: resolveWorkspaceComponent(config),
}))

export const WORKSPACE_ROUTE = WORKSPACE_ROUTES[0]

export function toWorkspaceRouteConfig(route: RouteRecordItem): WorkspaceRouteConfig {
  const { path, name, meta, icon } = route
  return {
    path,
    name,
    title: String(meta?.title ?? name),
    icon,
    menuType: MenuTypeEnum.MENU,
    isVisible: true,
  }
}

export function resolveWorkspaceRoute(
  config: WorkspaceRouteConfig,
  fullPath = config.path,
): RouteRecordItem {
  return {
    path: fullPath,
    name: config.name,
    component: resolveWorkspaceComponent(config),
    meta: { title: config.title },
    icon: config.icon,
  }
}
