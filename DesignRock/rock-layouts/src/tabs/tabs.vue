<template>
  <div
    class="relative flex h-full items-center"
    @contextmenu.capture="handleTabContextMenuCapture"
  >
    <GrowTabs
      v-if="tabList.length"
      v-model="tabsModelValue"
      type="card"
      class="grow-tabs-bar w-full"
      @tab-change="handleTabChange"
    >
      <GrowTabPane
        v-for="tab in tabList"
        :key="tab.fullPath"
        :name="tab.fullPath"
      >
        <template #label>
          <TabContextDropdown
            :tab="tab"
            :tab-list="tabList"
            @select="handleMenuSelect"
            @close="handleTabClose"
            @back="handleTabBack"
            @navigate-sub-page="handleNavigateSubPage"
            @refresh-sub-page="handleRefreshSubPage"
            @close-sub-page="handleCloseSubPage"
          />
        </template>
      </GrowTabPane>
    </GrowTabs>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import { Lib as routeLib } from '@grow-admin-rock/middleware-router'
import { resolveByKeyOrThrow } from '@grow-admin-rock/ioc'
import { storeToRefs, useTabStore } from '@grow-admin-rock/state'
import { useRoute } from '@grow-admin-rock/middleware-router'
import type { TabItem } from '@grow-admin-rock/types'
import { normalizePath } from './utils/tabUtils'
import TabContextDropdown from './TabContextDropdown.vue'
import type { TabContextAction } from './use/tabContextMenu'
import { provideTabContextMenu } from './use/tabContextMenuState'
import { useSortTabs } from './use/useSortTabs'

const useRouter = () => resolveByKeyOrThrow(routeLib.types.RouteTable).router

const { setOpenTabPath } = provideTabContextMenu()

const tabStore = useTabStore()
const route = useRoute()
const { tabList, activeTab } = storeToRefs(tabStore)

useSortTabs(() => tabList.value.length)

const currentFullPath = computed(() => normalizePath(route.fullPath))

const tabsModelValue = computed({
  get() {
    const parentTab = tabStore.findParentTabBySubPage(currentFullPath.value)
    if (parentTab) {
      return parentTab.fullPath
    }

    const matchedTab = tabList.value.find((tab) => tab.fullPath === currentFullPath.value)
    if (matchedTab) {
      return matchedTab.fullPath
    }
    return activeTab.value
  },
  set(value: string | number) {
    tabStore.setActiveTab(String(value))
  },
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

function handleTabChange(fullPath: string | number) {
  const path = String(fullPath)
  setOpenTabPath(null)
  tabStore.setActiveTab(path)
  navigateIfNeeded(path)
}

function handleTabClose(tab: TabItem) {
  if (tabStore.isSubPageOfTab(tab, currentFullPath.value)) {
    const parentPath = tabStore.closeSubPage(tab.fullPath, currentFullPath.value)
    navigateIfNeeded(parentPath)
    return
  }

  const nextPath = tabStore.closeTab(tab.fullPath)
  navigateIfNeeded(nextPath)
}

function handleTabBack(tab: TabItem) {
  navigateIfNeeded(tab.fullPath)
}

function handleNavigateSubPage(_tab: TabItem, subPageFullPath: string) {
  navigateIfNeeded(subPageFullPath)
}

function handleRefreshSubPage(_tab: TabItem, subPageFullPath: string) {
  tabStore.refreshSubPage(normalizePath(subPageFullPath))
}

function handleCloseSubPage(tab: TabItem, subPageFullPath: string) {
  const normalizedPath = normalizePath(subPageFullPath)
  tabStore.closeSubPage(tab.fullPath, normalizedPath)
  if (normalizedPath === currentFullPath.value) {
    navigateIfNeeded(tab.fullPath)
  }
}

function handleTabContextMenuCapture(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('.el-tabs__item, .ant-tabs-tab')) {
    event.preventDefault()
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

watch(
  () => route.fullPath,
  () => {
    setOpenTabPath(null)
    const normalizedPath = normalizePath(route.fullPath)
    const parentTab = tabStore.findParentTabBySubPage(normalizedPath)
    if (parentTab) {
      tabStore.syncStackSubPage(normalizedPath)
      return
    }
    if (tabList.value.some((tab) => tab.fullPath === normalizedPath)) {
      tabStore.setActiveTab(normalizedPath)
    }
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
.grow-tabs-bar {
  :deep(.el-tabs__header) {
    margin-bottom: 0;
    border-bottom: none;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__active-bar) {
    display: none;
  }

  :deep(.el-tabs__nav) {
    gap: 4px;
    border: none !important;
  }

  :deep(.el-tabs__item) {
    height: 32px;
    margin: 0;
    padding: 0 !important;
    border: none;
    background-color: transparent;
    color: var(--text-color);
    transition: color 0.2s;
    cursor: grab;

    &:active {
      cursor: grabbing;
    }

    .tab-close-btn,
    .tab-back-btn,
    .tab-subpage-btn,
    &:active .tab-close-btn,
    &:active .tab-back-btn,
    &:active .tab-subpage-btn {
      cursor: pointer;
    }

    .tab-label {
      height: 100%;
      border: 1px solid var(--layout-border-color);
      border-radius: 4px;
      background-color: var(--component-background-color);
      transition: color 0.2s, background-color 0.2s, border-color 0.2s;
    }

    .el-dropdown {
      height: 100%;
      border: none;
      border-radius: 0;
      background-color: transparent;
      color: inherit;
      font-size: inherit;
      line-height: inherit;
    }

    &:hover:not(.is-active) .tab-label {
      background-color: var(--color-primary-a06);
      border-color: var(--layout-border-color);
      color: var(--primary-color);
    }

    &.is-active {
      color: #fff;

      .tab-label {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
        color: #fff;
      }
    }
  }

  :deep(.el-tabs__content),
  :deep(.ant-tabs-content) {
    display: none;
  }

  :deep(.ant-tabs-nav) {
    margin-bottom: 0;
  }
}
</style>

<style lang="scss">
/* grow-tabs-bar 与 el-tabs--card 在同一节点，不能用后代选择器 */
.grow-tabs-bar.el-tabs--card {
  > .el-tabs__header {
    border-bottom: none;

    .el-tabs__nav {
      border: none;
    }

    .el-tabs__item,
    .el-tabs__item.is-active,
    .el-tabs__item:first-child {
      border: none !important;
      border-top: none !important;
      border-right: none !important;
      border-bottom: none !important;
      border-left: none !important;
      margin-top: 0;
    }
  }
}
</style>
