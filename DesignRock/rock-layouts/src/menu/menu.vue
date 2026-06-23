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
        :can-embed-i-frame-page="canEmbedIFramePage"
      />
    </GrowMenu>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { PageOpenModeEnum } from '@grow-admin-rock/constants'
import { Lib as routeLib } from '@grow-admin-rock/middleware-router'
import { resolveByKeyOrThrow } from '@grow-admin-rock/ioc'
import { storeToRefs, useAppConfig, useAuthStore, useLayout } from '@grow-admin-rock/state'
import type { Menu } from '@grow-admin-rock/types'
import MenuTreeNode from './MenuTreeNode.vue'
import { shouldRenderMenuItem } from './menuUtils'

const useRouter = () => resolveByKeyOrThrow(routeLib.types.RouteTable).router

const { isPutAway, isRoofLayout, isSideLayout } = useLayout()
const appConfig = useAppConfig()
const authStore = useAuthStore()
const { backMenuList: menuList } = storeToRefs(authStore)
const { canEmbedIFramePage } = storeToRefs(appConfig)
const visibleMenuList = computed(() => {
  return menuList.value.filter((item) => shouldRenderMenuItem(item, canEmbedIFramePage.value))
})
const activeMenu = computed(() => useRouter().currentRoute.value.path)

const menuMode = computed(() => (isRoofLayout.value ? 'horizontal' : 'vertical'))
const menuCollapse = computed(() => isSideLayout.value && !isPutAway.value)

function findMenuByIndex(menus: Menu[], index: string): Menu | null {
  for (const menu of menus) {
    if (getMenuIndex(menu) === index) {
      return menu
    }
    if (menu.children?.length) {
      const matched = findMenuByIndex(menu.children, index)
      if (matched) {
        return matched
      }
    }
  }
  return null
}

function getMenuIndex(item: Menu): string {
  if (item.openMode === PageOpenModeEnum.BROWSER) {
    return item.name
  }
  return item.path
}

function handleMenuSelect(index: string) {
  const menu = findMenuByIndex(menuList.value, index)
  if (menu?.openMode === PageOpenModeEnum.BROWSER && menu.link) {
    window.open(menu.link, '_blank')
    return
  }
  if (!index.startsWith('/')) {
    return
  }
  useRouter().push(index)
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
