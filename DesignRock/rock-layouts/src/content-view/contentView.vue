<template>
  <div class="relative h-full min-h-0 w-full overflow-hidden">
    <router-view v-slot="{ Component, route }">
      <keep-alive :include="cacheIncludeList">
        <component
          :is="Component"
          v-if="Component"
          v-show="!isIframeRoute(route)"
          :key="getComponentKey(route)"
          class="h-full"
        />
      </keep-alive>
    </router-view>
    <RenderIframe v-if="canEmbedIFramePage" class="absolute inset-0 z-[1]" />
  </div>
</template>

<script lang="ts" setup>
import { PageOpenModeEnum } from '@grow-admin-rock/constants'
import { RenderIframe } from '@grow-admin-rock/components/embed-page'
import { storeToRefs, useAppConfig, useTabStore } from '@grow-admin-rock/state'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { useTabRouteSync } from '../tabs/useTabRouteSync'

useTabRouteSync()

const tabStore = useTabStore()
const appConfig = useAppConfig()
const { cacheIncludeList, pageReloadKeys } = storeToRefs(tabStore)
const { canEmbedIFramePage } = storeToRefs(appConfig)

function getComponentKey(route: RouteLocationNormalizedLoaded) {
  const fullPath = route.path.replace(/\/+$/, '') || '/'
  const reloadKey = pageReloadKeys.value[fullPath] ?? 0
  const componentName = String(route.meta?.componentName ?? route.name ?? fullPath)
  return `${componentName}__${fullPath}__${reloadKey}`
}

function isIframeRoute(route: RouteLocationNormalizedLoaded) {
  return route.meta?.openMode === PageOpenModeEnum.IFRAME && Boolean(route.meta?.link)
}
</script>
