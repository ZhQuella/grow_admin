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
      menuType: menuItem.menuType,
      isVisible: menuItem.isVisible,
      isKeepAlive: menuItem.isKeepAlive,
      affix: menuItem.affix,
      defaultShow: menuItem.defaultShow,
      sort: menuItem.sort,
      componentKey: structure.componentKey,
      isExternalPage: menuItem.isExternalPage,
      openMode: menuItem.openMode,
      link: menuItem.link,
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
