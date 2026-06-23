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
import { normalizePath } from './tabUtils'
import TabContextDropdown from './TabContextDropdown.vue'
import type { TabContextAction } from './tabContextMenu'
import { provideTabContextMenu } from './tabContextMenuState'
import { useSortTabs } from './useSortTabs'

const useRouter = () => resolveByKeyOrThrow(routeLib.types.RouteTable).router

const { setOpenTabPath } = provideTabContextMenu()

const tabStore = useTabStore()
const route = useRoute()
const { tabList, activeTab } = storeToRefs(tabStore)

useSortTabs(() => tabList.value.length)

const tabsModelValue = computed({
  get() {
    const currentPath = normalizePath(route.path)
    const matchedTab = tabList.value.find((tab) => tab.fullPath === currentPath)
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
  if (router.currentRoute.value.path !== path) {
    router.push(path)
  }
}

function handleTabClose(tab: TabItem) {
  const nextPath = tabStore.closeTab(tab.fullPath)
  navigateIfNeeded(nextPath)
}

function handleTabContextMenuCapture(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('.el-tabs__item, .ant-tabs-tab')) {
    event.preventDefault()
  }
}

function handleTabChange(fullPath: string | number) {
  const path = String(fullPath)
  setOpenTabPath(null)
  tabStore.setActiveTab(path)
  navigateIfNeeded(path)
}

function handleMenuSelect(action: TabContextAction, tab: TabItem) {
  switch (action) {
    case 'reload':
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
  () => route.path,
  (path) => {
    setOpenTabPath(null)
    const normalizedPath = normalizePath(path)
    if (tabList.value.some((tab) => tab.fullPath === normalizedPath)) {
      tabStore.setActiveTab(normalizedPath)
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.grow-tabs-bar :deep(.el-tabs__header) {
  margin-bottom: 0;
  border-bottom: none;
}

.grow-tabs-bar :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.grow-tabs-bar :deep(.el-tabs__active-bar) {
  display: none;
}

.grow-tabs-bar :deep(.el-tabs__nav) {
  gap: 4px;
  border: none !important;
}

.grow-tabs-bar :deep(.el-tabs__item) {
  height: 32px;
  margin: 0;
  padding: 0 !important;
  border: none;
  background-color: transparent;
  color: var(--text-color);
  transition: color 0.2s;
  cursor: grab;
}

.grow-tabs-bar :deep(.el-tabs__item:active) {
  cursor: grabbing;
}

.grow-tabs-bar :deep(.el-tabs__item .tab-close-btn),
.grow-tabs-bar :deep(.el-tabs__item:active .tab-close-btn) {
  cursor: pointer;
}

.grow-tabs-bar :deep(.el-tabs__item .el-dropdown) {
  height: 100%;
  border: 1px solid var(--layout-border-color);
  border-radius: 4px;
  background-color: var(--component-background-color);
  color: inherit;
  font-size: inherit;
  line-height: inherit;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
}

.grow-tabs-bar :deep(.el-tabs__item:hover:not(.is-active) .el-dropdown) {
  background-color: var(--color-primary-a06);
  border-color: var(--layout-border-color);
  color: var(--primary-color);
}

.grow-tabs-bar :deep(.el-tabs__item.is-active) {
  color: #fff;
}

.grow-tabs-bar :deep(.el-tabs__item.is-active .el-dropdown) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: #fff;
}

.grow-tabs-bar :deep(.el-tabs__content),
.grow-tabs-bar :deep(.ant-tabs-content) {
  display: none;
}

.grow-tabs-bar :deep(.ant-tabs-nav) {
  margin-bottom: 0;
}
</style>

<style>
/* grow-tabs-bar 与 el-tabs--card 在同一节点，不能用后代选择器 */
.grow-tabs-bar.el-tabs--card > .el-tabs__header {
  border-bottom: none;
}

.grow-tabs-bar.el-tabs--card > .el-tabs__header .el-tabs__nav {
  border: none;
}

.grow-tabs-bar.el-tabs--card > .el-tabs__header .el-tabs__item,
.grow-tabs-bar.el-tabs--card > .el-tabs__header .el-tabs__item.is-active,
.grow-tabs-bar.el-tabs--card > .el-tabs__header .el-tabs__item:first-child {
  border: none !important;
  border-top: none !important;
  border-right: none !important;
  border-bottom: none !important;
  border-left: none !important;
  margin-top: 0;
}
</style>
