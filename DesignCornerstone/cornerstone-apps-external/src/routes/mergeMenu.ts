import type {
  ExternalMenuApiItem,
  ExternalRouteConfig,
  ExternalRouteStructure,
} from './config'

export function mergeExternalMenuWithStructure(
  menuItems: ExternalMenuApiItem[],
  structures: ExternalRouteStructure[],
): ExternalRouteConfig[] {
  return menuItems.map((menuItem) => {
    const structure = structures.find((item) => item.name === menuItem.name)
    if (!structure) {
      throw new Error(`Unknown external menu item: ${menuItem.name}`)
    }

    const config: ExternalRouteConfig = {
      path: structure.path,
      name: structure.name,
      title: menuItem.title,
      icon: menuItem.icon,
      menuType: menuItem.menuType,
      isVisible: menuItem.isVisible,
      isKeepAlive: menuItem.isKeepAlive,
      affix: menuItem.affix,
      defaultShow: menuItem.defaultShow,
      componentKey: structure.componentKey,
      isExternalPage: menuItem.isExternalPage,
      openMode: menuItem.openMode,
      link: menuItem.link,
    }

    if (menuItem.children?.length) {
      config.children = mergeExternalMenuWithStructure(
        menuItem.children,
        structure.children ?? [],
      )
    }

    return config
  })
}
