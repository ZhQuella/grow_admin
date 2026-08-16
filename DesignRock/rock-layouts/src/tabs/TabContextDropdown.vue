<template>
  <div class="tab-label inline-flex h-full items-center whitespace-nowrap text-inherit">
    <span
      v-if="showBackButton"
      class="tab-back-btn ml-1 inline-flex shrink-0 cursor-pointer items-center justify-center px-1 text-inherit opacity-80 hover:opacity-100"
      @click.stop="handleBack"
    >
      <GrowIconify icon="ant-design:arrow-left-outlined" :size="12" hover-pointer />
    </span>

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
        <span class="whitespace-nowrap text-inherit">{{ displayTitle }}</span>
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

    <GrowDropdown
      v-if="hasSubPages"
      trigger="hover"
      placement="bottom-start"
      :show-arrow="false"
      :show-timeout="120"
      :hide-timeout="180"
      class="inline-block h-full align-middle text-inherit"
    >
      <span
        class="tab-subpage-btn inline-flex h-full shrink-0 cursor-pointer items-center justify-center px-1.5 text-inherit opacity-80 hover:opacity-100"
      >
        <GrowIconify icon="ant-design:down-outlined" :size="10" hover-pointer />
      </span>
      <template #dropdown>
        <GrowDropdownMenu class="tab-subpage-dropdown-menu">
          <GrowDropdownItem
            v-for="subPage in subPages"
            :key="subPage.fullPath"
            class="tab-subpage-dropdown-item"
            :class="{ 'is-active': isActiveSubPage(subPage.fullPath) }"
          >
            <div class="tab-subpage-item">
              <span
                class="tab-subpage-item__title"
                @click="handleSubPageNavigate(subPage.fullPath)"
              >
                {{ subPage.title }}
              </span>
              <span class="tab-subpage-item__actions">
                <span
                  class="tab-subpage-item__action"
                  title="刷新"
                  @click.stop="handleSubPageRefresh(subPage.fullPath)"
                >
                  <GrowIconify icon="ant-design:reload-outlined" :size="12" />
                </span>
                <span
                  class="tab-subpage-item__action"
                  title="关闭"
                  @click.stop="handleSubPageClose(subPage.fullPath)"
                >
                  <GrowIconify icon="ant-design:close-outlined" :size="12" />
                </span>
              </span>
            </div>
          </GrowDropdownItem>
        </GrowDropdownMenu>
      </template>
      <template #overlay>
        <GrowMenu class="tab-subpage-dropdown-menu">
          <GrowMenuItem
            v-for="subPage in subPages"
            :key="subPage.fullPath"
            class="tab-subpage-dropdown-item"
            :class="{ 'is-active': isActiveSubPage(subPage.fullPath) }"
          >
            <div class="tab-subpage-item">
              <span
                class="tab-subpage-item__title"
                @click="handleSubPageNavigate(subPage.fullPath)"
              >
                {{ subPage.title }}
              </span>
              <span class="tab-subpage-item__actions">
                <span
                  class="tab-subpage-item__action"
                  title="刷新"
                  @click.stop="handleSubPageRefresh(subPage.fullPath)"
                >
                  <GrowIconify icon="ant-design:reload-outlined" :size="12" />
                </span>
                <span
                  class="tab-subpage-item__action"
                  title="关闭"
                  @click.stop="handleSubPageClose(subPage.fullPath)"
                >
                  <GrowIconify icon="ant-design:close-outlined" :size="12" />
                </span>
              </span>
            </div>
          </GrowMenuItem>
        </GrowMenu>
      </template>
    </GrowDropdown>

    <span
      v-if="!tab.affix"
      class="tab-close-btn mr-2 inline-flex shrink-0 cursor-pointer items-center justify-center text-inherit opacity-70 hover:opacity-100"
      @click.stop="handleClose"
    >
      <GrowIconify icon="ant-design:close-outlined" :size="12" hover-pointer />
    </span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from '@grow-admin-rock/middleware-router'
import { useTabStore } from '@grow-admin-rock/state'
import type { TabItem } from '@grow-admin-rock/types'
import { normalizePath } from './utils/tabUtils'
import { buildTabContextMenuItems, type TabContextAction } from './use/tabContextMenu'
import { useTabContextMenu } from './use/tabContextMenuState'

const props = defineProps<{
  tab: TabItem
  tabList: TabItem[]
}>()

const emit = defineEmits<{
  select: [action: TabContextAction, tab: TabItem]
  close: [tab: TabItem]
  back: [tab: TabItem]
  navigateSubPage: [tab: TabItem, subPageFullPath: string]
  refreshSubPage: [tab: TabItem, subPageFullPath: string]
  closeSubPage: [tab: TabItem, subPageFullPath: string]
}>()

const route = useRoute()
const tabStore = useTabStore()
const { dropdownVisible } = useTabContextMenu(props.tab.fullPath)

const currentFullPath = computed(() => normalizePath(route.fullPath))
const isViewingSubPage = computed(() => tabStore.isViewingSubPage(currentFullPath.value))
const isCurrentTabSubPage = computed(() => tabStore.isSubPageOfTab(props.tab, currentFullPath.value))
const storeTab = computed(() =>
  tabStore.tabList.find((item) => item.fullPath === props.tab.fullPath) ?? props.tab,
)
const subPages = computed(() => storeTab.value.subPages ?? [])
const hasSubPages = computed(() => subPages.value.length > 0)
const showBackButton = computed(() => isCurrentTabSubPage.value && isViewingSubPage.value)
const displayTitle = computed(() => tabStore.getTabDisplayTitle(storeTab.value, currentFullPath.value))

const menuItems = computed(() => buildTabContextMenuItems(props.tab, props.tabList, {
  isViewingSubPage: isViewingSubPage.value,
}))

function handleClose() {
  emit('close', props.tab)
}

function handleBack() {
  emit('back', props.tab)
}

function handleCommand(command: string | number) {
  emit('select', String(command) as TabContextAction, props.tab)
}

function handleAntMenuClick(info: { key: string | number }) {
  emit('select', String(info.key) as TabContextAction, props.tab)
}

function handleSubPageNavigate(subPageFullPath: string) {
  emit('navigateSubPage', props.tab, subPageFullPath)
}

function handleSubPageRefresh(subPageFullPath: string) {
  emit('refreshSubPage', props.tab, subPageFullPath)
}

function handleSubPageClose(subPageFullPath: string) {
  emit('closeSubPage', props.tab, subPageFullPath)
}

function isActiveSubPage(subPageFullPath: string) {
  return normalizePath(subPageFullPath) === currentFullPath.value
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

.tab-subpage-dropdown-menu.el-dropdown-menu {
  width: max-content;
  min-width: 180px;
  padding: 4px 0;
}

.tab-context-dropdown-menu .el-dropdown-menu__item {
  display: flex;
  justify-content: flex-start;
  padding: 5px 12px;
  line-height: 22px;
}

.tab-subpage-dropdown-menu .el-dropdown-menu__item {
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 4px 8px 4px 12px;
  line-height: 22px;
}

.tab-subpage-dropdown-menu .el-dropdown-menu__item.tab-subpage-dropdown-item,
.tab-subpage-dropdown-menu .ant-menu-item.tab-subpage-dropdown-item {
  cursor: default;
}

.tab-subpage-dropdown-menu .el-dropdown-menu__item.tab-subpage-dropdown-item:hover,
.tab-subpage-dropdown-menu .ant-menu-item.tab-subpage-dropdown-item:hover {
  background-color: var(--color-primary-a06);
  color: inherit;
}

.tab-subpage-dropdown-menu .el-dropdown-menu__item.tab-subpage-dropdown-item.is-active,
.tab-subpage-dropdown-menu .el-dropdown-menu__item.tab-subpage-dropdown-item.is-active:hover,
.tab-subpage-dropdown-menu .ant-menu-item.tab-subpage-dropdown-item.is-active,
.tab-subpage-dropdown-menu .ant-menu-item.tab-subpage-dropdown-item.is-active:hover {
  background-color: var(--color-primary-a12);
  color: var(--primary-color);
}

.tab-subpage-dropdown-menu .el-dropdown-menu__item.tab-subpage-dropdown-item.is-active .tab-subpage-item__title,
.tab-subpage-dropdown-menu .ant-menu-item.tab-subpage-dropdown-item.is-active .tab-subpage-item__title {
  color: var(--primary-color);
  font-weight: 500;
}

.tab-context-dropdown-menu.ant-menu {
  width: max-content;
  padding: 4px 0;
}

.tab-subpage-dropdown-menu.ant-menu {
  width: max-content;
  min-width: 180px;
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

.tab-subpage-dropdown-menu .ant-menu-item {
  display: flex;
  align-items: center;
  height: auto;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 4px 8px 4px 12px;
  line-height: 22px;
  cursor: default;
}

.tab-subpage-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.tab-subpage-item__title {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  cursor: pointer;
}

.tab-subpage-item__actions {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.tab-subpage-item__action {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  padding: 0;
  border-radius: 4px;
  line-height: 0;
  color: var(--text-color-secondary);
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
}

.tab-subpage-item__action .grow-iconify {
  display: inline-flex !important;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  line-height: 0;
  color: inherit !important;
}

.tab-subpage-item__action .grow-iconify svg,
.tab-subpage-item__action .grow-iconify i {
  display: block;
  width: 12px;
  height: 12px;
  margin: 0;
}

.tab-subpage-item__action:hover,
.tab-subpage-dropdown-menu .el-dropdown-menu__item.tab-subpage-dropdown-item.is-active .tab-subpage-item__action:hover,
.tab-subpage-dropdown-menu .ant-menu-item.tab-subpage-dropdown-item.is-active .tab-subpage-item__action:hover {
  color: var(--primary-color);
  background-color: var(--color-primary-a16);
}

.tab-context-dropdown-menu .tab-context-menu-item--divided {
  border-top: 1px solid var(--layout-border-color);
  margin-top: 4px;
  padding-top: 9px;
}
</style>
