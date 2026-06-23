import type {
  FeatMenuApiItem,
  FeatRouteConfig,
  FeatRouteStructure,
} from './config'

export function mergeFeatMenuWithStructure(
  menuItems: FeatMenuApiItem[],
  structures: FeatRouteStructure[],
): FeatRouteConfig[] {
  return menuItems.map((menuItem) => {
    const structure = structures.find((item) => item.name === menuItem.name)
    if (!structure) {
      throw new Error(`Unknown feat menu item: ${menuItem.name}`)
    }

    const config: FeatRouteConfig = {
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
      config.children = mergeFeatMenuWithStructure(
        menuItem.children,
        structure.children ?? [],
      )
    }

    return config
  })
}
