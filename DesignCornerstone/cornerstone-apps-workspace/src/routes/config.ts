export type WorkspaceRouteConfig = Pick<RouteRecordItem, 'path' | 'name' | 'meta' | 'icon'> & {
  children?: WorkspaceRouteConfig[]
}

export const WORKSPACE_ROUTE_CONFIGS: WorkspaceRouteConfig[] = [
  {
    path: 'workspace-catalog',
    name: 'WorkspaceCatalog',
    icon: 'ant-design:folder-outlined',
    meta: {
      title: '工作区',
    },
    children: [
      {
        path: 'workspace',
        name: 'Workspace',
        icon: 'ant-design:appstore-outlined',
        meta: {
          title: '工作台',
        },
      },
      {
        path: 'settings',
        name: 'WorkspaceSettings',
        icon: 'ant-design:setting-outlined',
        meta: {
          title: '设置中心',
        },
      },
    ],
  },
]

export function flattenWorkspaceRouteConfigs(
  configs: WorkspaceRouteConfig[],
): WorkspaceRouteConfig[] {
  return configs.flatMap((config) =>
    config.children?.length
      ? flattenWorkspaceRouteConfigs(config.children)
      : [config],
  )
}
