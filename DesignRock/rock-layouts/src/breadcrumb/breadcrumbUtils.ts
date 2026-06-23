import type { Menu } from '@grow-admin-rock/types'
import type { RouteRecordName } from 'vue-router'

export type BreadcrumbItem = Pick<Menu, 'title' | 'path' | 'name'>

function normalizePath(path: string): string {
  return path.replace(/\/+$/, '') || '/'
}

function isMenuRouteMatched(
  menu: Menu,
  currentPath: string,
  currentName: RouteRecordName | null | undefined,
): boolean {
  if (!menu.path.startsWith('/')) {
    return false
  }
  if (normalizePath(menu.path) === normalizePath(currentPath)) {
    return true
  }
  if (currentName != null && menu.name === String(currentName)) {
    return true
  }
  return false
}

function findMenuBreadcrumbTrail(
  menus: Menu[],
  currentPath: string,
  currentName: RouteRecordName | null | undefined,
  trail: BreadcrumbItem[] = [],
): BreadcrumbItem[] | null {
  for (const menu of menus) {
    const nextTrail: BreadcrumbItem[] = [...trail, {
      title: menu.title,
      path: menu.path,
      name: menu.name,
    }]

    if (isMenuRouteMatched(menu, currentPath, currentName)) {
      return nextTrail
    }

    if (menu.children?.length) {
      const childTrail = findMenuBreadcrumbTrail(
        menu.children,
        currentPath,
        currentName,
        nextTrail,
      )
      if (childTrail) {
        return childTrail
      }
    }
  }

  return null
}

/** 根据当前路由 path / name，从菜单树解析完整面包屑链路（不受 isVisible 过滤影响） */
export function resolveMenuBreadcrumbTrail(
  menus: Menu[],
  currentPath: string,
  currentName?: RouteRecordName | null,
): BreadcrumbItem[] {
  return findMenuBreadcrumbTrail(menus, currentPath, currentName ?? null) ?? []
}

/**
 * 动态子页面面包屑：保留父级菜单链路，最后一层使用 tab 自定义标题。
 */
export function resolveDynamicSubPageBreadcrumbTrail(
  menus: Menu[],
  currentFullPath: string,
  parentRouteName: string,
  lastLayerTitle: string,
  currentRouteName?: RouteRecordName | null,
): BreadcrumbItem[] {
  const parentTrail = resolveMenuBreadcrumbTrail(menus, '', parentRouteName)
  const lastItem: BreadcrumbItem = {
    title: lastLayerTitle,
    path: normalizePath(currentFullPath),
    name: String(currentRouteName ?? parentRouteName),
  }

  if (!parentTrail.length) {
    return [lastItem]
  }

  return [...parentTrail, lastItem]
}
