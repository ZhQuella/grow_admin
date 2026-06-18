<template>
  <GrowBreadcrumb v-if="breadcrumbTrail.length" class="grow-breadcrumb">
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
import { storeToRefs, useAuthStore } from '@grow-admin-rock/state'
import type { BreadcrumbItem } from './breadcrumbUtils'
import { resolveMenuBreadcrumbTrail } from './breadcrumbUtils'

const route = useRoute()
const authStore = useAuthStore()
const { backMenuList } = storeToRefs(authStore)

const breadcrumbTrail = computed(() => {
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
