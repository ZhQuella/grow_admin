import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'
import type { Menu } from '@grow-admin-rock/types'

/** 直接子级中是否存在可见项 */
export function hasVisibleDirectChild(item: Menu, canEmbedIFramePage = true): boolean {
  return item.children?.some((child) => isMenuItemVisible(child, canEmbedIFramePage)) ?? false
}

/** iframe 菜单是否允许展示 */
export function isIframeMenuAllowed(item: Menu, canEmbedIFramePage: boolean): boolean {
  if (item.openMode !== PageOpenModeEnum.IFRAME) {
    return true
  }
  return canEmbedIFramePage
}

/** 菜单项是否可见（含 iframe 开关） */
export function isMenuItemVisible(item: Menu, canEmbedIFramePage = true): boolean {
  if (!item.isVisible) {
    return false
  }
  if (!isIframeMenuAllowed(item, canEmbedIFramePage)) {
    return false
  }
  return true
}

/** 是否应在菜单中渲染：自身可见，且目录类型需至少有一个可见的直接子级 */
export function shouldRenderMenuItem(item: Menu, canEmbedIFramePage = true): boolean {
  if (!isMenuItemVisible(item, canEmbedIFramePage)) {
    return false
  }
  if (item.menuType === MenuTypeEnum.DIRECTORY) {
    return hasVisibleDirectChild(item, canEmbedIFramePage)
  }
  return true
}

/** 是否按目录（SubMenu）展示：目录类型，或菜单类型且存在可见的直接子级 */
export function shouldDisplayAsSubMenu(item: Menu, canEmbedIFramePage = true): boolean {
  if (item.menuType === MenuTypeEnum.DIRECTORY) {
    return true
  }
  return hasVisibleDirectChild(item, canEmbedIFramePage)
}

/** 根据当前路由找到其所属的一级菜单 */
export function findRootMenuByPath(menus: Menu[], currentPath: string): Menu | null {
  function containsPath(menu: Menu): boolean {
    if (menu.path.startsWith('/') && menu.path === currentPath) {
      return true
    }
    return menu.children?.some(containsPath) ?? false
  }

  return menus.find(containsPath) ?? null
}
