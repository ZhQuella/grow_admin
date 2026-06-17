<template>
  <GrowSubMenu v-if="item.children?.length" :index="item.path">
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
  <GrowMenuItem v-else :index="item.path">
    <i v-if="item.icon" class="el-icon">
      <GrowIconify :icon="item.icon" :size="18" hover-pointer />
    </i>
    <template #title>{{ item.title }}</template>
  </GrowMenuItem>
</template>

<script lang="ts" setup>
import type { Menu } from '@grow-admin-rock/types'

defineOptions({
  name: 'MenuTreeNode',
})

defineProps<{
  item: Menu
}>()
</script>
