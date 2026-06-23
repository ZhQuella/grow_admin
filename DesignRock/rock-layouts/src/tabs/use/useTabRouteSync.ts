import { watch } from 'vue'
import { Lib as routeLib, useRoute } from '@grow-admin-rock/middleware-router'
import { resolveByKeyOrThrow } from '@grow-admin-rock/ioc'
import { storeToRefs, useAuthStore, useTabStore } from '@grow-admin-rock/state'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { findNavigableMenuByPath, normalizePath } from '../utils/tabUtils'

/** 在 ContentView 中同步 tab 与 keep-alive 缓存，确保路由切换前 cacheIncludeList 已就绪 */
export function useTabRouteSync() {
  const route = useRoute()
  const tabStore = useTabStore()
  const authStore = useAuthStore()
  const { backMenuList } = storeToRefs(authStore)
  const router = resolveByKeyOrThrow(routeLib.types.RouteTable).router

  function syncDynamicTab(currentRoute: RouteLocationNormalizedLoaded) {
    if (!currentRoute.meta?.dynamicTab) {
      return
    }

    tabStore.openDynamicTab({
      fullPath: normalizePath(currentRoute.fullPath),
      name: String(currentRoute.meta.componentName ?? currentRoute.name),
      title: String(currentRoute.meta.title ?? currentRoute.name),
      isKeepAlive: currentRoute.meta.isKeepAlive !== false,
    })
  }

  function syncTabWithRoute(currentRoute: RouteLocationNormalizedLoaded) {
    const path = currentRoute.path
    const menu = findNavigableMenuByPath(backMenuList.value, path)
    if (menu) {
      tabStore.openTab(menu)
      return
    }

    syncDynamicTab(currentRoute)
  }

  function bootstrapDefaultTabs(): boolean {
    if (!backMenuList.value.length) {
      return false
    }

    const defaultPath = tabStore.initDefaultTabs(backMenuList.value)
    if (!defaultPath) {
      return false
    }

    const currentMenu = findNavigableMenuByPath(backMenuList.value, route.path)
    if (!currentMenu && normalizePath(route.path) !== defaultPath) {
      router.replace(defaultPath)
      return true
    }

    syncTabWithRoute(route)
    return false
  }

  watch(
    () => route.fullPath,
    () => {
      if (bootstrapDefaultTabs()) {
        return
      }
      syncTabWithRoute(route)
    },
    { immediate: true, flush: 'sync' },
  )

  watch(
    backMenuList,
    () => {
      tabStore.syncTabTitlesFromMenus(backMenuList.value)
      tabStore.rebuildCacheList()
      if (bootstrapDefaultTabs()) {
        return
      }
      syncTabWithRoute(route)
    },
    { immediate: true },
  )
}
