<template>
  <div
    class="h-full w-full"
    :class="isHorizontalMenu ? 'grow-roof-menu min-w-0 overflow-hidden' : ''"
  >
    <GrowMenu
      :mode="menuMode"
      class="!border-none"
      :class="isHorizontalMenu ? 'grow-roof-menu__bar' : ''"
      :collapse="menuCollapse"
      :default-active="selectedMenu"
      :ellipsis="isHorizontalMenu"
      @select="handleMenuSelect"
    >
      <MenuTreeNode
        v-for="item in visibleMenuList"
        :key="item.path"
        :item="item"
        :can-embed-i-frame-page="canEmbedIFramePage"
        :force-menu-item="isFirstLevel"
        :index="isFirstLevel ? item.name : undefined"
      />
    </GrowMenu>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import { PageOpenModeEnum } from '@grow-admin-rock/constants'
import { Lib as routeLib } from '@grow-admin-rock/middleware-router'
import { resolveByKeyOrThrow } from '@grow-admin-rock/ioc'
import { storeToRefs, useAppConfig, useAuthMenuList, useLayout } from '@grow-admin-rock/state'
import type { Menu } from '@grow-admin-rock/types'
import MenuTreeNode from './MenuTreeNode.vue'
import { findRootMenuByPath, shouldRenderMenuItem } from './menuUtils'

type MenuLevel = 'all' | 'first' | 'children'

const props = withDefaults(defineProps<{
  level?: MenuLevel
  activeRootMenu?: string
}>(), {
  level: 'all',
  activeRootMenu: '',
})

const emit = defineEmits<{
  (event: 'select-root', name: string, hasChildren: boolean): void
}>()

const useRouter = () => resolveByKeyOrThrow(routeLib.types.RouteTable).router

const { isPutAway, isRoofLayout, isSideLayout, isMixedLayout } = useLayout()
const appConfig = useAppConfig()
const menuList = useAuthMenuList()
const { canEmbedIFramePage } = storeToRefs(appConfig)
const visibleRootMenuList = computed(() => {
  return menuList.value.filter((item) => shouldRenderMenuItem(item, canEmbedIFramePage.value))
})
const activeRoot = computed(() => {
  return visibleRootMenuList.value.find((item) => item.name === props.activeRootMenu)
})
const visibleMenuList = computed(() => {
  if (props.level === 'children') {
    return activeRoot.value?.children?.filter(
      (item) => shouldRenderMenuItem(item, canEmbedIFramePage.value),
    ) ?? []
  }
  return visibleRootMenuList.value
})
const activeMenu = computed(() => useRouter().currentRoute.value.path)

const isFirstLevel = computed(() => props.level === 'first')
const isHorizontalMenu = computed(() => isRoofLayout.value || isFirstLevel.value)
const menuMode = computed(() => (isHorizontalMenu.value ? 'horizontal' : 'vertical'))
const menuCollapse = computed(() => {
  return !isFirstLevel.value
    && (isSideLayout.value || isMixedLayout.value)
    && !isPutAway.value
})
const selectedMenu = computed(() => {
  return isFirstLevel.value ? props.activeRootMenu : activeMenu.value
})

function hasVisibleChildren(menu: Menu): boolean {
  return menu.children?.some(
    (item) => shouldRenderMenuItem(item, canEmbedIFramePage.value),
  ) ?? false
}

function selectRoot(menu: Menu) {
  emit('select-root', menu.name, hasVisibleChildren(menu))
}

watch(
  [activeMenu, visibleRootMenuList],
  ([currentPath, roots]) => {
    if (!isFirstLevel.value) {
      return
    }
    const routeRoot = findRootMenuByPath(roots, currentPath)
    if (routeRoot) {
      selectRoot(routeRoot)
      return
    }
    if (!roots.some((item) => item.name === props.activeRootMenu) && roots[0]) {
      selectRoot(roots[0])
    }
  },
  { immediate: true },
)

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
  if (isFirstLevel.value) {
    const rootMenu = visibleRootMenuList.value.find((item) => item.name === index)
    if (!rootMenu) {
      return
    }
    selectRoot(rootMenu)
    if (hasVisibleChildren(rootMenu)) {
      return
    }
    openMenu(rootMenu)
    return
  }

  const menu = findMenuByIndex(menuList.value, index)
  if (menu) {
    openMenu(menu)
  }
}

function openMenu(menu: Menu) {
  if (menu?.openMode === PageOpenModeEnum.BROWSER && menu.link) {
    window.open(menu.link, '_blank')
    return
  }
  if (!menu.path.startsWith('/')) {
    return
  }
  useRouter().push(menu.path)
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
