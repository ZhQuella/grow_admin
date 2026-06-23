import { unref } from 'vue'
import { type ServiceIdentifier, diKT, resolveByKeyOrThrow } from '@grow-admin-rock/ioc'
import { useRoute, Lib as routeLib } from '@grow-admin-rock/middleware-router'
import type { RouteOperator } from '@grow-admin-rock/middleware-router'
import type { RouteLocationRaw } from 'vue-router'
import { useTabStore } from '@grow-admin-rock/state'

function normalizePath(path: string): string {
  return path.replace(/\/+$/, '') || '/'
}

function createRouteNavigate() {
  const routeOperator = diKT(
    routeLib.types.RouteOperator as ServiceIdentifier<RouteOperator>,
  )

  const go = (to: RouteLocationRaw, replace = false) => {
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
      go(nextPath)
    }
  }

  function closeAll() {
    navigateAfterClose(tabStore.closeAllTabs())
  }

  function closeLeft() {
    navigateAfterClose(tabStore.closeLeftTabs(getCurrentFullPath()))
  }

  function closeRight() {
    navigateAfterClose(tabStore.closeRightTabs(getCurrentFullPath()))
  }

  function closeOther() {
    navigateAfterClose(tabStore.closeOtherTabs(getCurrentFullPath()))
  }

  function closeCurrent() {
    navigateAfterClose(tabStore.closeTab(getCurrentFullPath()))
  }

  function reloadCurrent() {
    const fullPath = getCurrentFullPath()
    const router = resolveByKeyOrThrow(routeLib.types.RouteTable).router
    if (tabStore.activeTab !== fullPath) {
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
