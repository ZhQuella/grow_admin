import { FEAT_FRONT_ONLY_MENU_LIST, FEAT_MENU_LIST } from './menuList'
import {
  FEAT_FRONT_ONLY_STRUCTURES,
  FEAT_ROUTE_STRUCTURES,
  type FeatMenuApiItem,
  type FeatRouteConfig,
  type FeatRouteStructure,
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
      sort: menuItem.sort,
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

/** 前端完整路由配置 = 公共 feat + 仅前端演示 */
export function toFeatRouteConfigs(
  menuItems: FeatMenuApiItem[] = [...FEAT_MENU_LIST, ...FEAT_FRONT_ONLY_MENU_LIST],
  structures: FeatRouteStructure[] = [...FEAT_ROUTE_STRUCTURES, ...FEAT_FRONT_ONLY_STRUCTURES],
): FeatRouteConfig[] {
  return mergeFeatMenuWithStructure(menuItems, structures)
}
