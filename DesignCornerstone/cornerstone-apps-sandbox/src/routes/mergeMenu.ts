import { SANDBOX_MENU_LIST } from './menuList'
import {
  SANDBOX_ROUTE_STRUCTURES,
  type SandboxMenuApiItem,
  type SandboxRouteConfig,
  type SandboxRouteStructure,
} from './config'

export function mergeSandboxMenuWithStructure(
  menuItems: SandboxMenuApiItem[],
  structures: SandboxRouteStructure[],
): SandboxRouteConfig[] {
  return menuItems.map((menuItem) => {
    const structure = structures.find((item) => item.name === menuItem.name)
    if (!structure) {
      throw new Error(`Unknown sandbox menu item: ${menuItem.name}`)
    }

    const config: SandboxRouteConfig = {
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
      config.children = mergeSandboxMenuWithStructure(
        menuItem.children,
        structure.children ?? [],
      )
    }

    return config
  })
}

export function toSandboxRouteConfigsFromMenu(
  menuItems: SandboxMenuApiItem[] = SANDBOX_MENU_LIST,
  structures: SandboxRouteStructure[] = SANDBOX_ROUTE_STRUCTURES,
): SandboxRouteConfig[] {
  return mergeSandboxMenuWithStructure(menuItems, structures)
}
