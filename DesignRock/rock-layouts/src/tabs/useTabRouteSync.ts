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

  function syncTabWithRoute(path: string) {
    const menu = findNavigableMenuByPath(backMenuList.value, path)
    if (!menu) {
      return
    }
    tabStore.openTab(menu)
  }

  function bootstrapAffixTabs(): boolean {
    if (!backMenuList.value.length) {
      return false
    }

    const affixPath = tabStore.initAffixTabs(backMenuList.value)
    if (!affixPath) {
      return false
    }

    const currentMenu = findNavigableMenuByPath(backMenuList.value, route.path)
    if (!currentMenu && normalizePath(route.path) !== affixPath) {
      router.replace(affixPath)
      return true
    }

    syncTabWithRoute(route.path)
    return false
  }

  watch(
    () => route.path,
    (path) => {
      if (bootstrapAffixTabs()) {
        return
      }
      syncTabWithRoute(path)
    },
    { immediate: true, flush: 'sync' },
  )

  watch(
    backMenuList,
    () => {
      tabStore.syncTabTitlesFromMenus(backMenuList.value)
      tabStore.rebuildCacheList()
      if (bootstrapAffixTabs()) {
        return
      }
      syncTabWithRoute(route.path)
    },
    { immediate: true },
  )
}
