import { computed } from 'vue'
import { Lib as routeLib } from '@grow-admin-rock/middleware-router'
import { resolveByKeyOrThrow } from '@grow-admin-rock/ioc'
import { storeToRefs, useTabStore } from '@grow-admin-rock/state'
import { useRoute } from '@grow-admin-rock/middleware-router'
import type { TabItem } from '@grow-admin-rock/types'
import { normalizePath } from '../utils/tabUtils'
import type { TabContextAction } from './tabContextMenu'

const useRouter = () => resolveByKeyOrThrow(routeLib.types.RouteTable).router

export function useTabContextActions() {
  const tabStore = useTabStore()
  const route = useRoute()
  const { tabList, activeTab } = storeToRefs(tabStore)

  const currentFullPath = computed(() => normalizePath(route.fullPath))

  const currentTab = computed(() => {
    const parentTab = tabStore.findParentTabBySubPage(currentFullPath.value)
    if (parentTab) {
      return parentTab
    }

    return (
      tabList.value.find((tab) => tab.fullPath === currentFullPath.value)
      ?? tabList.value.find((tab) => tab.fullPath === activeTab.value)
      ?? null
    )
  })

  function navigateIfNeeded(path: string | null) {
    if (!path) {
      return
    }
    const router = useRouter()
    const normalizedPath = normalizePath(path)
    if (normalizePath(router.currentRoute.value.fullPath) !== normalizedPath) {
      router.push(path)
    }
  }

  function handleMenuSelect(action: TabContextAction, tab: TabItem) {
    const viewingSubPage = tabStore.isViewingSubPage(currentFullPath.value)

    switch (action) {
      case 'reload':
        if (viewingSubPage) {
          tabStore.refreshSubPage(currentFullPath.value)
          break
        }
        if (tabStore.activeTab !== tab.fullPath) {
          tabStore.setActiveTab(tab.fullPath)
          useRouter().push(tab.fullPath).then(() => {
            tabStore.refreshTab(tab.fullPath)
          })
        } else {
          tabStore.refreshTab(tab.fullPath)
        }
        break
      case 'close':
        if (viewingSubPage) {
          const parentTab = tabStore.findParentTabBySubPage(currentFullPath.value)
          if (parentTab) {
            tabStore.closeSubPage(parentTab.fullPath, currentFullPath.value)
            navigateIfNeeded(parentTab.fullPath)
          }
          break
        }
        navigateIfNeeded(tabStore.closeTab(tab.fullPath))
        break
      case 'closeLeft':
        navigateIfNeeded(tabStore.closeLeftTabs(tab.fullPath))
        break
      case 'closeRight':
        navigateIfNeeded(tabStore.closeRightTabs(tab.fullPath))
        break
      case 'closeOther':
        navigateIfNeeded(tabStore.closeOtherTabs(tab.fullPath))
        break
      case 'closeAll':
        navigateIfNeeded(tabStore.closeAllTabs())
        break
    }
  }

  function refreshCurrentTab() {
    const tab = currentTab.value
    if (!tab) {
      return
    }
    handleMenuSelect('reload', tab)
  }

  return {
    tabList,
    currentTab,
    currentFullPath,
    handleMenuSelect,
    refreshCurrentTab,
    navigateIfNeeded,
  }
}
