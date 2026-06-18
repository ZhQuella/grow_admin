import { MenuTypeEnum } from '@grow-admin-rock/constants'
import type { Menu } from '@grow-admin-rock/types'

/** 直接子级中是否存在可见项 */
export function hasVisibleDirectChild(item: Menu): boolean {
  return item.children?.some((child) => child.isVisible) ?? false
}

/** 是否应在菜单中渲染：自身可见，且目录类型需至少有一个可见的直接子级 */
export function shouldRenderMenuItem(item: Menu): boolean {
  if (!item.isVisible) {
    return false
  }
  if (item.menuType === MenuTypeEnum.DIRECTORY) {
    return hasVisibleDirectChild(item)
  }
  return true
}

/** 是否按目录（SubMenu）展示：目录类型，或菜单类型且存在可见的直接子级 */
export function shouldDisplayAsSubMenu(item: Menu): boolean {
  if (item.menuType === MenuTypeEnum.DIRECTORY) {
    return true
  }
  return hasVisibleDirectChild(item)
}
