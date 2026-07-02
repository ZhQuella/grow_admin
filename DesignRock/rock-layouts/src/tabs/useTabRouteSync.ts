import { watch } from 'vue'
import { Lib as routeLib, useRoute } from '@grow-admin-rock/middleware-router'
import { resolveByKeyOrThrow } from '@grow-admin-rock/ioc'
import { storeToRefs, useAuthStore, useTabStore } from '@grow-admin-rock/state'
import { findNavigableMenuByPath, normalizePath } from './tabUtils'

/** 在 ContentView 中同步 tab 与 keep-alive 缓存，确保路由切换前 cacheIncludeList 已就绪 */
export function useTabRouteSync() {
  const route = useRoute()
  const tabStore = useTabStore()
  const authStore = useAuthStore()
  const { backMenuList } = storeToRefs(authStore)
  const router = resolveByKeyOrThrow(routeLib.types.RouteTable).router

  function isRouteAvailable(fullPath: string): boolean {
    const { matched } = router.resolve(fullPath)
    if (!matched.length) {
      return false
    }
    const lastMatched = matched[matched.length - 1]
    return lastMatched?.name !== 'Home' && lastMatched?.name !== 'HomeIndexRedirect'
  }

  function syncTabWithRoute(path: string) {
    const menu = findNavigableMenuByPath(backMenuList.value, path)
    if (!menu) {
      return
    }
    tabStore.openTab(menu)
  }

  function redirectIfNeeded(redirectPath: string | null): boolean {
    if (!redirectPath) {
      return false
    }
    if (normalizePath(route.fullPath) === normalizePath(redirectPath)) {
      return false
    }
    router.replace(redirectPath)
    return true
  }

  function bootstrapDefaultTabs(): boolean {
    if (!backMenuList.value.length) {
      return false
    }

    tabStore.syncTabsWithMenus(backMenuList.value, isRouteAvailable)

    const defaultPath = tabStore.initDefaultTabs(backMenuList.value)
    if (defaultPath) {
      const currentMenu = findNavigableMenuByPath(backMenuList.value, route.path)
      if (!currentMenu && normalizePath(route.path) !== defaultPath) {
        router.replace(defaultPath)
        return true
      }
    }

    const redirectPath = tabStore.resolveInvalidNavigationPath(
      route.fullPath,
      backMenuList.value,
      isRouteAvailable,
    )
    if (redirectIfNeeded(redirectPath)) {
      return true
    }

    syncTabWithRoute(route.path)
    return false
  }

  watch(
    () => route.path,
    (path) => {
      if (bootstrapDefaultTabs()) {
        return
      }
      syncTabWithRoute(path)
    },
    { immediate: true, flush: 'sync' },
  )

  watch(
    backMenuList,
    () => {
      if (bootstrapDefaultTabs()) {
        return
      }
      syncTabWithRoute(route.path)
    },
    { immediate: true },
  )
}
