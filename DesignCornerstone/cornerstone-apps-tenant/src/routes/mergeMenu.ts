import { TENANT_MENU_LIST } from './menuList'
import {
  TENANT_ROUTE_STRUCTURES,
  type TenantMenuApiItem,
  type TenantRouteConfig,
  type TenantRouteStructure,
} from './config'

export function mergeTenantMenuWithStructure(
  menuItems: TenantMenuApiItem[],
  structures: TenantRouteStructure[],
): TenantRouteConfig[] {
  return menuItems.map((menuItem) => {
    const structure = structures.find((item) => item.name === menuItem.name)
    if (!structure) {
      throw new Error(`Unknown tenant menu item: ${menuItem.name}`)
    }

    const config: TenantRouteConfig = {
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
      config.children = mergeTenantMenuWithStructure(
        menuItem.children,
        structure.children ?? [],
      )
    }

    return config
  })
}

export function toTenantRouteConfigsFromMenu(
  menuItems: TenantMenuApiItem[] = TENANT_MENU_LIST,
  structures: TenantRouteStructure[] = TENANT_ROUTE_STRUCTURES,
): TenantRouteConfig[] {
  return mergeTenantMenuWithStructure(menuItems, structures)
}
