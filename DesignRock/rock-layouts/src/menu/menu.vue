<template>
  <GrowMenu
    class="!border-none"
    :collapse="!isPutAway"
    :default-active="activeMenu"
    @select="handleMenuSelect"
  >
    <MenuTreeNode
      v-for="item in menuList"
      :key="item.path"
      :item="item"
    />
  </GrowMenu>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Lib as routeLib } from '@grow-admin-rock/middleware-router'
import { resolveByKeyOrThrow } from '@grow-admin-rock/ioc'
import { storeToRefs, useAuthStore, useLayout } from '@grow-admin-rock/state'
import MenuTreeNode from './MenuTreeNode.vue'

const useRouter = () => resolveByKeyOrThrow(routeLib.types.RouteTable).router

const { isPutAway } = useLayout()
const authStore = useAuthStore()
const { backMenuList: menuList } = storeToRefs(authStore)
const activeMenu = computed(() => useRouter().currentRoute.value.path)

function handleMenuSelect(path: string) {
  if (!path.startsWith('/')) {
    return
  }
  useRouter().push(path)
}
</script>
