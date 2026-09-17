import { MenuTypeEnum } from '@grow-admin-rock/constants'
import {
  WORKSPACE_ROUTE_STRUCTURES,
  flattenWorkspaceRouteConfigs,
  toWorkspaceRouteConfigs,
  type WorkspaceRouteConfig,
  type WorkspaceRouteStructure,
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

const WORKSPACE_ROUTE_COMPONENTS: Record<string, GrowRouteComponent> = {
  DataReport: () => import('../pages/data-report/data-report.vue'),
  Analysis: () => import('../pages/analysis/analysis.vue'),
  MixtureBackDemo: () => import('../pages/mixture-back-demo/mixture-back-demo.vue'),
}

function bindWorkspaceRouteComponents(
  structures: WorkspaceRouteStructure[],
): WorkspaceRouteStructure[] {
  return structures.map((structure) => ({
    ...structure,
    component: WORKSPACE_ROUTE_COMPONENTS[structure.name],
    children: structure.children?.length
      ? bindWorkspaceRouteComponents(structure.children)
      : structure.children,
  }))
}

export const WORKSPACE_CLIENT_ROUTE_STRUCTURES = bindWorkspaceRouteComponents(
  WORKSPACE_ROUTE_STRUCTURES,
)

function resolveWorkspaceComponent(config: WorkspaceRouteConfig): GrowRouteComponent {
  if (!config.component) {
    throw new Error(`Workspace route "${String(config.name)}" is missing its component`)
  }
  return config.component
}

export const WORKSPACE_ROUTES: RouteRecordItem[] = flattenWorkspaceRouteConfigs(
  toWorkspaceRouteConfigs(WORKSPACE_CLIENT_ROUTE_STRUCTURES),
).map(({ fullPath, ...config }) => resolveWorkspaceRoute(config, fullPath))

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
