<template>
  <div class="flex shrink-0 items-center justify-end gap-0.5">
    <GrowButton
      circle
      text
      class="!ml-[0px]"
      :disabled="!currentTab"
      title="刷新"
      aria-label="刷新"
      @click="refreshCurrentTab"
    >
      <GrowIconify icon="ant-design:reload-outlined" :size="16" hover-pointer />
    </GrowButton>

    <GrowButton
      circle
      text
      class="!ml-[0px]"
      :title="isFullScreen ? '退出全屏' : '内容全屏'"
      :aria-label="isFullScreen ? '退出全屏' : '内容全屏'"
      @click="toggleWebFullScreen"
    >
      <GrowIconify
        :icon="isFullScreen ? 'ant-design:fullscreen-exit-outlined' : 'ant-design:fullscreen-outlined'"
        :size="16"
        hover-pointer
      />
    </GrowButton>

    <GrowDropdown
      trigger="click"
      placement="bottom-end"
      :show-arrow="false"
      :disabled="!currentTab"
      @command="handleCommand"
    >
      <GrowButton
        circle
        text
        class="!ml-[0px]"
        :disabled="!currentTab"
        title="标签操作"
        aria-label="标签操作"
      >
        <GrowIconify icon="ant-design:more-outlined" :size="16" hover-pointer />
      </GrowButton>
      <template #dropdown>
        <GrowDropdownMenu class="tab-context-dropdown-menu">
          <GrowDropdownItem
            v-for="item in menuItems"
            :key="item.action"
            :command="item.action"
            :disabled="item.disabled"
            :divided="item.divided"
          >
            <span class="tab-context-menu-item">
              <span class="tab-context-menu-item__icon">
                <GrowIconify :icon="item.icon" :size="15" />
              </span>
              <span class="tab-context-menu-item__label">{{ item.label }}</span>
            </span>
          </GrowDropdownItem>
        </GrowDropdownMenu>
      </template>
      <template #overlay>
        <GrowMenu class="tab-context-dropdown-menu" @click="handleAntMenuClick">
          <GrowMenuItem
            v-for="item in menuItems"
            :key="item.action"
            :disabled="item.disabled"
            :class="{ 'tab-context-menu-item--divided': item.divided }"
            v-bind="{ key: item.action }"
          >
            <span class="tab-context-menu-item">
              <span class="tab-context-menu-item__icon">
                <GrowIconify :icon="item.icon" :size="15" />
              </span>
              <span class="tab-context-menu-item__label">{{ item.label }}</span>
            </span>
          </GrowMenuItem>
        </GrowMenu>
      </template>
    </GrowDropdown>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAppStore, useTabStore } from '@grow-admin-rock/state'
import { buildTabContextMenuItems, type TabContextAction } from '../tabs/use/tabContextMenu'
import { useTabContextActions } from '../tabs/use/useTabContextActions'

const tabStore = useTabStore()
const appStore = useAppStore()
const { tabList, currentTab, currentFullPath, handleMenuSelect, refreshCurrentTab } = useTabContextActions()

const isFullScreen = computed(() => appStore.getWebFullScreen)

const isViewingSubPage = computed(() => tabStore.isViewingSubPage(currentFullPath.value))

const menuItems = computed(() => {
  const tab = currentTab.value
  if (!tab) {
    return []
  }
  return buildTabContextMenuItems(tab, tabList.value, {
    isViewingSubPage: isViewingSubPage.value,
  })
})

function toggleWebFullScreen() {
  appStore.setWebFullScreen(!appStore.getWebFullScreen)
}

function handleCommand(command: string | number) {
  const tab = currentTab.value
  if (!tab) {
    return
  }
  handleMenuSelect(String(command) as TabContextAction, tab)
}

function handleAntMenuClick(info: { key: string | number }) {
  const tab = currentTab.value
  if (!tab) {
    return
  }
  handleMenuSelect(String(info.key) as TabContextAction, tab)
}
</script>

<style>
.tab-context-menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  font-size: 14px;
  line-height: 22px;
}

.tab-context-menu-item__icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 16px;
  margin-right: 8px;
  color: var(--text-color-secondary);
}

.tab-context-menu-item__label {
  flex: 1;
  text-align: left;
  white-space: nowrap;
}

.tab-context-dropdown-menu.el-dropdown-menu {
  width: max-content;
  min-width: unset;
  padding: 4px 0;
}

.tab-context-dropdown-menu .el-dropdown-menu__item {
  display: flex;
  justify-content: flex-start;
  padding: 5px 12px;
  line-height: 22px;
}

.tab-context-dropdown-menu.ant-menu {
  width: max-content;
  padding: 4px 0;
}

.tab-context-dropdown-menu .ant-menu-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: auto;
  margin: 0;
  padding: 5px 12px;
  line-height: 22px;
}

.tab-context-dropdown-menu .tab-context-menu-item--divided {
  border-top: 1px solid var(--layout-border-color);
  margin-top: 4px;
  padding-top: 9px;
}
</style>
