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
        :force-menu-item="shouldForceMenuItem(item)"
        :clickable-title="isFirstLevel && item.menuType === MenuTypeEnum.MENU"
        :active="isFirstLevel && item.name === props.activeRootMenu"
        :index="isFirstLevel ? item.name : undefined"
        @title-click="handleRootMenuTitleClick(item)"
      />
    </GrowMenu>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'
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
  (event: 'select-root', name: string, hasChildren: boolean, revealChildren?: boolean): void
}>()

const useRouter = () => resolveByKeyOrThrow(routeLib.types.RouteTable).router

const {
  isPutAway,
  isRoofLayout,
  isSideLayout,
  isMixedLayout,
  isDoubleSideLayout,
} = useLayout()
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
const isHorizontalMenu = computed(() => {
  return isRoofLayout.value || (isFirstLevel.value && !isDoubleSideLayout.value)
})
const menuMode = computed(() => (isHorizontalMenu.value ? 'horizontal' : 'vertical'))
const menuCollapse = computed(() => {
  if (isFirstLevel.value) {
    return isDoubleSideLayout.value
  }
  return (isSideLayout.value || isMixedLayout.value || isDoubleSideLayout.value)
    && !isPutAway.value
})
const selectedMenu = computed(() => {
  if (
    isFirstLevel.value
    && isDoubleSideLayout.value
    && !isPutAway.value
    && activeRoot.value
    && hasVisibleChildren(activeRoot.value)
  ) {
    return activeMenu.value
  }
  return isFirstLevel.value ? props.activeRootMenu : activeMenu.value
})

function hasVisibleChildren(menu: Menu): boolean {
  return menu.children?.some(
    (item) => shouldRenderMenuItem(item, canEmbedIFramePage.value),
  ) ?? false
}

function selectRoot(menu: Menu, revealChildren = false) {
  emit('select-root', menu.name, hasVisibleChildren(menu), revealChildren)
}

function shouldForceMenuItem(menu: Menu): boolean {
  if (!isFirstLevel.value) {
    return false
  }
  return !(
    isDoubleSideLayout.value
    && !isPutAway.value
    && hasVisibleChildren(menu)
  )
}

function handleRootMenuTitleClick(menu: Menu) {
  if (!isFirstLevel.value || menu.menuType !== MenuTypeEnum.MENU) {
    return
  }
  selectRoot(menu, true)
  openMenu(menu)
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
    if (rootMenu) {
      selectRoot(rootMenu, true)
      if (rootMenu.menuType !== MenuTypeEnum.MENU && hasVisibleChildren(rootMenu)) {
        return
      }
      openMenu(rootMenu)
      return
    }

    const childMenu = findMenuByIndex(menuList.value, index)
    if (childMenu) {
      openMenu(childMenu)
    }
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
