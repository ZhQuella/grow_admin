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
import { storeToRefs, useAuthStore, useTabStore } from '@grow-admin-rock/state'
import type { BreadcrumbItem } from './breadcrumbUtils'
import {
  resolveDynamicSubPageBreadcrumbTrail,
  resolveMenuBreadcrumbTrail,
} from './breadcrumbUtils'

function normalizePath(path: string): string {
  return path.replace(/\/+$/, '') || '/'
}

const route = useRoute()
const authStore = useAuthStore()
const tabStore = useTabStore()
const { backMenuList } = storeToRefs(authStore)
const { tabList } = storeToRefs(tabStore)

const breadcrumbTrail = computed(() => {
  const parentRouteName = route.meta?.breadcrumbParentName
  if (route.meta?.dynamicTab && parentRouteName) {
    const fullPath = normalizePath(route.fullPath)
    const tab = tabList.value.find((item) => item.fullPath === fullPath)
    const lastLayerTitle = tab?.title ?? String(route.meta.title ?? route.name)
    return resolveDynamicSubPageBreadcrumbTrail(
      backMenuList.value,
      route.fullPath,
      String(parentRouteName),
      lastLayerTitle,
      route.name,
    )
  }

  return resolveMenuBreadcrumbTrail(
    backMenuList.value,
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
