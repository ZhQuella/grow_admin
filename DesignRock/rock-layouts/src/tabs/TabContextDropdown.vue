<template>
  <GrowDropdown
    v-model:visible="dropdownVisible"
    trigger="contextmenu"
    placement="bottom-start"
    :show-arrow="false"
    class="inline-block h-full align-middle text-inherit"
    @command="handleCommand"
  >
    <div
      class="inline-flex h-full items-center px-3 whitespace-nowrap text-inherit"
      @contextmenu.prevent
    >
      <span class="whitespace-nowrap text-inherit">{{ tab.title }}</span>
      <span
        v-if="!tab.affix"
        class="tab-close-btn ml-2 inline-flex shrink-0 cursor-pointer items-center justify-center text-inherit opacity-70 hover:opacity-100"
        @click.stop="handleClose"
      >
        <GrowIconify icon="ant-design:close-outlined" :size="12" hover-pointer />
      </span>
    </div>
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
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { TabItem } from '@grow-admin-rock/types'
import { buildTabContextMenuItems, type TabContextAction } from './tabContextMenu'
import { useTabContextMenu } from './tabContextMenuState'

const props = defineProps<{
  tab: TabItem
  tabList: TabItem[]
}>()

const emit = defineEmits<{
  select: [action: TabContextAction, tab: TabItem]
  close: [tab: TabItem]
}>()

const { dropdownVisible } = useTabContextMenu(props.tab.fullPath)

const menuItems = computed(() => buildTabContextMenuItems(props.tab, props.tabList))

function handleClose() {
  emit('close', props.tab)
}

function handleCommand(command: string | number) {
  emit('select', String(command) as TabContextAction, props.tab)
}

function handleAntMenuClick(info: { key: string | number }) {
  emit('select', String(info.key) as TabContextAction, props.tab)
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
