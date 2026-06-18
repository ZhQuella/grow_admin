import { watch } from 'vue'
import { useRoute } from '@grow-admin-rock/middleware-router'
import { storeToRefs, useAuthStore, useTabStore } from '@grow-admin-rock/state'
import { findNavigableMenuByPath } from './tabUtils'

/** 在 ContentView 中同步 tab 与 keep-alive 缓存，确保路由切换前 cacheIncludeList 已就绪 */
export function useTabRouteSync() {
  const route = useRoute()
  const tabStore = useTabStore()
  const authStore = useAuthStore()
  const { backMenuList } = storeToRefs(authStore)

  function syncTabWithRoute(path: string) {
    const menu = findNavigableMenuByPath(backMenuList.value, path)
    if (!menu) {
      return
    }
    tabStore.openTab(menu)
  }

  watch(
    () => route.path,
    (path) => {
      syncTabWithRoute(path)
    },
    { immediate: true, flush: 'sync' },
  )

  watch(
    backMenuList,
    () => {
      tabStore.syncTabTitlesFromMenus(backMenuList.value)
      tabStore.rebuildCacheList()
      syncTabWithRoute(route.path)
    },
    { immediate: true },
  )
}
