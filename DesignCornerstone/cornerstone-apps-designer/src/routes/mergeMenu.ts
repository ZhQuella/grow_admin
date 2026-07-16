import { DESIGNER_MENU_LIST } from './menuList'
import {
  DESIGNER_ROUTE_STRUCTURES,
  type DesignerMenuApiItem,
  type DesignerRouteConfig,
  type DesignerRouteStructure,
} from './config'

export function mergeDesignerMenuWithStructure(
  menuItems: DesignerMenuApiItem[],
  structures: DesignerRouteStructure[],
): DesignerRouteConfig[] {
  return menuItems.map((menuItem) => {
    const structure = structures.find((item) => item.name === menuItem.name)
    if (!structure) {
      throw new Error(`Unknown designer menu item: ${menuItem.name}`)
    }

    const config: DesignerRouteConfig = {
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
      config.children = mergeDesignerMenuWithStructure(
        menuItem.children,
        structure.children ?? [],
      )
    }

    return config
  })
}

export function toDesignerRouteConfigsFromMenu(
  menuItems: DesignerMenuApiItem[] = DESIGNER_MENU_LIST,
  structures: DesignerRouteStructure[] = DESIGNER_ROUTE_STRUCTURES,
): DesignerRouteConfig[] {
  return mergeDesignerMenuWithStructure(menuItems, structures)
}
