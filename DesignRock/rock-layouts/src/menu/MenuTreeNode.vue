<template>
  <GrowSubMenu
    v-if="shouldRender && displayAsSubMenu"
    :index="item.name"
    :class="{
      'is-active': active,
      'ant-menu-submenu-selected': active,
    }"
  >
    <template #title>
      <i v-if="item.icon" class="el-icon" @click="handleTitleClick">
        <GrowIconify :icon="item.icon" :size="18" hover-pointer />
      </i>
      <span @click="handleTitleClick">{{ item.title }}</span>
    </template>
    <MenuTreeNode
      v-for="child in item.children"
      :key="child.path"
      :item="child"
      :can-embed-i-frame-page="canEmbedIFramePage"
    />
  </GrowSubMenu>
  <GrowMenuItem v-else-if="shouldRender" :index="menuIndex">
    <i v-if="item.icon" class="el-icon">
      <GrowIconify :icon="item.icon" :size="18" hover-pointer />
    </i>
    <span>{{ item.title }}</span>
  </GrowMenuItem>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { PageOpenModeEnum } from '@grow-admin-rock/constants'
import type { Menu } from '@grow-admin-rock/types'
import { shouldDisplayAsSubMenu, shouldRenderMenuItem } from './menuUtils'

defineOptions({
  name: 'MenuTreeNode',
})

const props = defineProps<{
  item: Menu
  canEmbedIFramePage?: boolean
  forceMenuItem?: boolean
  clickableTitle?: boolean
  active?: boolean
  index?: string
}>()

const emit = defineEmits<{
  (event: 'title-click'): void
}>()

function handleTitleClick(event: MouseEvent) {
  if (!props.clickableTitle) {
    return
  }
  event.stopPropagation()
  emit('title-click')
}

const displayAsSubMenu = computed(() => {
  return !props.forceMenuItem
    && shouldDisplayAsSubMenu(props.item, props.canEmbedIFramePage ?? true)
})
const shouldRender = computed(() => shouldRenderMenuItem(props.item, props.canEmbedIFramePage ?? true))
const menuIndex = computed(() => {
  if (props.index) {
    return props.index
  }
  if (props.item.openMode === PageOpenModeEnum.BROWSER) {
    return props.item.name
  }
  return props.item.path
})
</script>
