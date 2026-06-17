import {
  WORKSPACE_ROUTE_CONFIGS,
  flattenWorkspaceRouteConfigs,
  type WorkspaceRouteConfig,
} from './config'

export type { WorkspaceRouteConfig } from './config'
export { WORKSPACE_ROUTE_CONFIGS, flattenWorkspaceRouteConfigs } from './config'

const WORKSPACE_COMPONENTS: Record<string, GrowRouteComponent> = {
  Workspace: () => import('../pages/workspace.vue'),
  WorkspaceSettings: () => import('../pages/settings.vue'),
}

export const WORKSPACE_ROUTES: RouteRecordItem[] = flattenWorkspaceRouteConfigs(
  WORKSPACE_ROUTE_CONFIGS,
).map((config) => ({
  ...config,
  component: WORKSPACE_COMPONENTS[String(config.name)],
}))

export const WORKSPACE_ROUTE = WORKSPACE_ROUTES[0]

export function toWorkspaceRouteConfig(route: RouteRecordItem): WorkspaceRouteConfig {
  const { path, name, meta, icon } = route
  return { path, name, meta, icon }
}

export function resolveWorkspaceRoute(config: WorkspaceRouteConfig): RouteRecordItem {
  const route = WORKSPACE_ROUTES.find((item) => item.name === config.name)
  if (!route) {
    throw new Error(`Unknown workspace route: ${String(config.name)}`)
  }
  return {
    ...route,
    ...config,
    meta: { ...route.meta, ...config.meta },
  }
}
