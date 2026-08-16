import { SYSTEM_MENU_LIST } from './menuList'
import {
  SYSTEM_ROUTE_STRUCTURES,
  type SystemMenuApiItem,
  type SystemRouteConfig,
  type SystemRouteStructure,
} from './config'

export function mergeSystemMenuWithStructure(
  menuItems: SystemMenuApiItem[],
  structures: SystemRouteStructure[],
): SystemRouteConfig[] {
  return menuItems.map((menuItem) => {
    const structure = structures.find((item) => item.name === menuItem.name)
    if (!structure) {
      throw new Error(`Unknown system menu item: ${menuItem.name}`)
    }

    const config: SystemRouteConfig = {
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
      config.children = mergeSystemMenuWithStructure(
        menuItem.children,
        structure.children ?? [],
      )
    }

    return config
  })
}

export function toSystemRouteConfigsFromMenu(
  menuItems: SystemMenuApiItem[] = SYSTEM_MENU_LIST,
  structures: SystemRouteStructure[] = SYSTEM_ROUTE_STRUCTURES,
): SystemRouteConfig[] {
  return mergeSystemMenuWithStructure(menuItems, structures)
}
