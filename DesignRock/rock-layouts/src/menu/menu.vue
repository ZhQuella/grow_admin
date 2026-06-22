<template>
  <div
    class="h-full w-full"
    :class="isRoofLayout ? 'grow-roof-menu min-w-0 overflow-hidden' : ''"
  >
    <GrowMenu
      :mode="menuMode"
      class="!border-none"
      :class="isRoofLayout ? 'grow-roof-menu__bar' : ''"
      :collapse="menuCollapse"
      :default-active="activeMenu"
      :ellipsis="isRoofLayout"
      @select="handleMenuSelect"
    >
      <MenuTreeNode
        v-for="item in visibleMenuList"
        :key="item.path"
        :item="item"
      />
    </GrowMenu>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Lib as routeLib } from '@grow-admin-rock/middleware-router'
import { resolveByKeyOrThrow } from '@grow-admin-rock/ioc'
import { storeToRefs, useAuthStore, useLayout } from '@grow-admin-rock/state'
import MenuTreeNode from './MenuTreeNode.vue'
import { shouldRenderMenuItem } from './menuUtils'

const useRouter = () => resolveByKeyOrThrow(routeLib.types.RouteTable).router

const { isPutAway, isRoofLayout, isSideLayout } = useLayout()
const authStore = useAuthStore()
const { backMenuList: menuList } = storeToRefs(authStore)
const visibleMenuList = computed(() => menuList.value.filter((item) => shouldRenderMenuItem(item)))
const activeMenu = computed(() => useRouter().currentRoute.value.path)

const menuMode = computed(() => (isRoofLayout.value ? 'horizontal' : 'vertical'))
const menuCollapse = computed(() => isSideLayout.value && !isPutAway.value)

function handleMenuSelect(path: string) {
  if (!path.startsWith('/')) {
    return
  }
  useRouter().push(path)
}
</script>

<style scoped>
.grow-roof-menu__bar.el-menu--horizontal,
.grow-roof-menu :deep(.el-menu--horizontal) {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  height: 49px;
  border-bottom: none !important;
  background-color: transparent !important;
}

.grow-roof-menu :deep(.el-menu--horizontal > .el-menu-item),
.grow-roof-menu :deep(.el-menu--horizontal > .el-sub-menu .el-sub-menu__title) {
  height: 49px;
  line-height: 49px;
  border-bottom: none !important;
}

.grow-roof-menu :deep(.ant-menu-horizontal) {
  line-height: 49px;
  border-bottom: none !important;
  background: transparent !important;
}
</style>
