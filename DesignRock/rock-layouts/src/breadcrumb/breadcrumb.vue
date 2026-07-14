<template>
  <GrowBreadcrumb v-if="breadcrumbTrail.length" class="grow-breadcrumb shrink-0 whitespace-nowrap">
    <GrowBreadcrumbItem
      v-for="(item, index) in breadcrumbTrail"
      :key="`${item.name}-${index}`"
      :to="getBreadcrumbLink(item, index)"
    >
      {{ item.title }}
    </GrowBreadcrumbItem>
  </GrowBreadcrumb>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from '@grow-admin-rock/middleware-router'
import { storeToRefs, useAuthMenuList, useTabStore } from '@grow-admin-rock/state'
import type { BreadcrumbItem } from './breadcrumbUtils'
import {
  resolveDynamicSubPageBreadcrumbTrail,
  resolveMenuBreadcrumbTrail,
} from './breadcrumbUtils'

function normalizePath(path: string): string {
  return path.replace(/\/+$/, '') || '/'
}

const route = useRoute()
const tabStore = useTabStore()
const menuList = useAuthMenuList()
const { tabList } = storeToRefs(tabStore)

const breadcrumbTrail = computed(() => {
  const parentRouteName = route.meta?.breadcrumbParentName
  if (route.meta?.dynamicTab && parentRouteName) {
    const fullPath = normalizePath(route.fullPath)
    const subPageTitle = tabStore.getSubPageTitle(fullPath)
    const tab = tabList.value.find((item) => item.fullPath === fullPath)
    const lastLayerTitle = subPageTitle ?? tab?.title ?? String(route.meta.title ?? route.name)
    return resolveDynamicSubPageBreadcrumbTrail(
      menuList.value,
      route.fullPath,
      String(parentRouteName),
      lastLayerTitle,
      route.name,
    )
  }

  return resolveMenuBreadcrumbTrail(
    menuList.value,
    route.path,
    route.name,
  )
})

function getBreadcrumbLink(item: BreadcrumbItem, index: number) {
  if (index === breadcrumbTrail.value.length - 1) {
    return undefined
  }
  return item.path.startsWith('/') ? item.path : undefined
}
</script>

<style scoped>
.grow-breadcrumb {
  line-height: 50px;
}
</style>
