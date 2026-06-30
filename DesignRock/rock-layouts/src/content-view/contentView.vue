<template>
  <div class="grid h-full min-h-0 w-full grid-cols-1 grid-rows-1 overflow-hidden">
    <div class="col-start-1 row-start-1 min-h-0 min-w-0 overflow-hidden">
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="cacheIncludeList">
          <component
            :is="getKeepAliveComponent(Component, route)"
            v-if="Component"
            v-show="!isIframeRoute(route)"
            :key="getComponentKey(route)"
            class="h-full"
          />
        </keep-alive>
      </router-view>
    </div>
    <RenderIframe
      v-if="canEmbedIFramePage"
      v-show="isCurrentRouteIframe"
      class="col-start-1 row-start-1 min-h-0 min-w-0 overflow-hidden"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { PageOpenModeEnum } from '@grow-admin-rock/constants'
import { useRoute } from '@grow-admin-rock/middleware-router'
import { RenderIframe } from '../embed-page'
import { resolveTabCacheName, storeToRefs, useAppConfig, useTabStore } from '@grow-admin-rock/state'
import type { Component } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { useTabRouteSync } from '../tabs/use/useTabRouteSync'
import { wrapKeepAliveComponent } from './wrapKeepAliveComponent'

useTabRouteSync()

const route = useRoute()
const tabStore = useTabStore()
const appConfig = useAppConfig()
const { cacheIncludeList, pageReloadKeys } = storeToRefs(tabStore)
const { canEmbedIFramePage } = storeToRefs(appConfig)

const isCurrentRouteIframe = computed(() => isIframeRoute(route))

function resolveRouteCacheBaseName(route: RouteLocationNormalizedLoaded) {
  if (route.meta?.dynamicTab) {
    return String(route.meta.componentName ?? route.name)
  }
  return String(route.name)
}

function resolveRouteCacheName(route: RouteLocationNormalizedLoaded) {
  const fullPath = route.fullPath.replace(/\/+$/, '') || '/'
  return resolveTabCacheName(fullPath, resolveRouteCacheBaseName(route))
}

function getKeepAliveComponent(
  component: Component | null,
  route: RouteLocationNormalizedLoaded,
) {
  if (!component) {
    return component
  }
  return wrapKeepAliveComponent(component, resolveRouteCacheName(route))
}

function getComponentKey(route: RouteLocationNormalizedLoaded) {
  const fullPath = route.fullPath.replace(/\/+$/, '') || '/'
  const reloadKey = pageReloadKeys.value[fullPath] ?? 0
  return `${resolveRouteCacheName(route)}__${reloadKey}`
}

function isIframeRoute(route: RouteLocationNormalizedLoaded) {
  return route.meta?.openMode === PageOpenModeEnum.IFRAME && Boolean(route.meta?.link)
}
</script>
