<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="cacheIncludeList">
      <component
        :is="Component"
        v-if="Component"
        :key="getComponentKey(route)"
      />
    </keep-alive>
  </router-view>
</template>

<script lang="ts" setup>
import { storeToRefs, useTabStore } from '@grow-admin-rock/state'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { useTabRouteSync } from '../tabs/useTabRouteSync'

useTabRouteSync()

const tabStore = useTabStore()
const { cacheIncludeList, pageReloadKeys } = storeToRefs(tabStore)

function getComponentKey(route: RouteLocationNormalizedLoaded) {
  const fullPath = route.path.replace(/\/+$/, '') || '/'
  const reloadKey = pageReloadKeys.value[fullPath] ?? 0
  const componentName = String(route.meta?.componentName ?? route.name ?? fullPath)
  return `${componentName}__${fullPath}__${reloadKey}`
}
</script>
