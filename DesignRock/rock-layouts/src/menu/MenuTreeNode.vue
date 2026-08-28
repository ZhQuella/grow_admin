<template>
  <GrowSubMenu v-if="shouldRender && displayAsSubMenu" :index="item.name">
    <template #title>
      <i v-if="item.icon" class="el-icon">
        <GrowIconify :icon="item.icon" :size="18" hover-pointer />
      </i>
      <span>{{ item.title }}</span>
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
  index?: string
}>()

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
