import { unref } from 'vue'
import { type ServiceIdentifier, diKT, resolveByKeyOrThrow } from '@grow-admin-rock/ioc'
import { useRoute, Lib as routeLib } from '@grow-admin-rock/middleware-router'
import type { RouteOperator } from '@grow-admin-rock/middleware-router'
import type { RouteLocationRaw } from 'vue-router'
import { normalizeTabPath, useAuthMenuList, useTabStore } from '@grow-admin-rock/state'
import type { GoTabOptions } from '@grow-admin-rock/types'

function normalizePath(path: string): string {
  return normalizeTabPath(path)
}

function createRouteNavigate() {
  const routeOperator = diKT(
    routeLib.types.RouteOperator as ServiceIdentifier<RouteOperator>,
  )
  const tabStore = useTabStore()
  const menuList = useAuthMenuList()

  const go = (to: RouteLocationRaw, options?: boolean | GoTabOptions) => {
    let replace = false
    let tabOptions: GoTabOptions = {}

    if (typeof options === 'boolean') {
      replace = options
    } else if (options) {
      tabOptions = options
    }

    const tabMode = tabOptions.tabMode ?? 'newTab'
    if (tabMode === 'stack') {
      const parentName = tabOptions.parentName
      if (!parentName) {
        routeOperator.go(to, replace)
        return
      }

      const router = resolveByKeyOrThrow(routeLib.types.RouteTable).router
      const resolved = router.resolve(to)
      tabStore.prepareStackSubPage({
        parentName,
        subPage: {
          fullPath: normalizePath(resolved.fullPath),
          name: String(resolved.name),
          title: String(resolved.meta?.title ?? resolved.name),
          isKeepAlive: resolved.meta?.isKeepAlive !== false,
        },
        menus: menuList.value,
      })
    }

    routeOperator.go(to, replace)
  }

  return {
    go,
    replace: (to: RouteLocationRaw) => go(to, true),
    redo: routeOperator.redo,
  }
}

export function useRouteNavigate() {
  return createRouteNavigate()
}

export function useTabs() {
  const tabStore = useTabStore()
  const route = useRoute()
  const navigate = createRouteNavigate()
  const { go } = navigate

  function getCurrentFullPath() {
    return normalizePath(unref(route).fullPath)
  }

  function navigateAfterClose(nextPath: string | null) {
    if (nextPath) {
      go(tabStore.resolveTabNavigatePath(nextPath))
    }
  }

  function closeAll() {
    navigateAfterClose(tabStore.closeAllTabs())
  }

  function closeLeft() {
    navigateAfterClose(tabStore.closeLeftTabs(tabStore.activeTab))
  }

  function closeRight() {
    navigateAfterClose(tabStore.closeRightTabs(tabStore.activeTab))
  }

  function closeOther() {
    navigateAfterClose(tabStore.closeOtherTabs(tabStore.activeTab))
  }

  function closeCurrent() {
    const currentPath = getCurrentFullPath()
    if (tabStore.isViewingSubPage(currentPath)) {
      const parentTab = tabStore.findParentTabBySubPage(currentPath)
      if (parentTab) {
        tabStore.closeSubPage(parentTab.fullPath, currentPath)
        go(parentTab.fullPath)
      }
      return
    }
    navigateAfterClose(tabStore.closeTab(currentPath))
  }

  function reloadCurrent() {
    const fullPath = getCurrentFullPath()
    const router = resolveByKeyOrThrow(routeLib.types.RouteTable).router

    if (tabStore.isViewingSubPage(fullPath)) {
      tabStore.refreshSubPage(fullPath)
      return
    }

    const activeTabPath = tabStore.activeTab
    if (activeTabPath !== fullPath) {
      tabStore.setActiveTab(fullPath)
      router.push(fullPath).then(() => {
        tabStore.refreshTab(fullPath)
      })
      return
    }
    tabStore.refreshTab(fullPath)
  }

  function setTab(title: string) {
    tabStore.setTabTitle(getCurrentFullPath(), title)
  }

  return {
    ...navigate,
    setTab,
    closeAll,
    closeLeft,
    closeRight,
    closeOther,
    closeCurrent,
    reloadCurrent,
  }
}
