import { MenuTypeEnum } from '@grow-admin-rock/constants'
import type { Menu } from '@grow-admin-rock/types'

function normalizePath(path: string): string {
  return path.replace(/\/+$/, '') || '/'
}

export { normalizePath }

/** 根据路由 name 从菜单树查找菜单项 */
export function findMenuByName(menus: Menu[], name: string): Menu | null {
  for (const menu of menus) {
    if (menu.name === name) {
      return menu
    }
    if (menu.children?.length) {
      const matched = findMenuByName(menu.children, name)
      if (matched) {
        return matched
      }
    }
  }
  return null
}

/** 根据 fullPath 从菜单树查找可跳转的菜单项 */
export function findNavigableMenuByPath(menus: Menu[], fullPath: string): Menu | null {
  const normalizedPath = normalizePath(fullPath)

  for (const menu of menus) {
    if (
      menu.menuType === MenuTypeEnum.MENU
      && menu.path.startsWith('/')
      && normalizePath(menu.path) === normalizedPath
    ) {
      return menu
    }

    if (menu.children?.length) {
      const matched = findNavigableMenuByPath(menu.children, normalizedPath)
      if (matched) {
        return matched
      }
    }
  }

  return null
}
