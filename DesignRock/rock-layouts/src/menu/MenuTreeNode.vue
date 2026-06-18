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
    />
  </GrowSubMenu>
  <GrowMenuItem v-else-if="shouldRender" :index="item.path">
    <i v-if="item.icon" class="el-icon">
      <GrowIconify :icon="item.icon" :size="18" hover-pointer />
    </i>
    <template #title>{{ item.title }}</template>
  </GrowMenuItem>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { Menu } from '@grow-admin-rock/types'
import { shouldDisplayAsSubMenu, shouldRenderMenuItem } from './menuUtils'

defineOptions({
  name: 'MenuTreeNode',
})

const props = defineProps<{
  item: Menu
}>()

const displayAsSubMenu = computed(() => shouldDisplayAsSubMenu(props.item))
const shouldRender = computed(() => shouldRenderMenuItem(props.item))
</script>
