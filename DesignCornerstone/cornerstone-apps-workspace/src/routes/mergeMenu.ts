import type {
  WorkspaceMenuApiItem,
  WorkspaceRouteConfig,
  WorkspaceRouteStructure,
} from './config'

export function mergeMenuWithStructure(
  menuItems: WorkspaceMenuApiItem[],
  structures: WorkspaceRouteStructure[],
): WorkspaceRouteConfig[] {
  return menuItems.map((menuItem) => {
    const structure = structures.find((item) => item.name === menuItem.name)
    if (!structure) {
      throw new Error(`Unknown menu item: ${menuItem.name}`)
    }

    const config: WorkspaceRouteConfig = {
      path: structure.path,
      name: structure.name,
      title: menuItem.title,
      icon: menuItem.icon,
      componentKey: structure.componentKey,
    }

    if (menuItem.children?.length) {
      config.children = mergeMenuWithStructure(
        menuItem.children,
        structure.children ?? [],
      )
    }

    return config
  })
}
