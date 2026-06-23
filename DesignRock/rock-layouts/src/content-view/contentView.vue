<template>
  <div class="relative h-full min-h-0 w-full overflow-hidden">
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
    <RenderIframe v-if="canEmbedIFramePage" class="absolute inset-0 z-[1]" />
  </div>
</template>

<script lang="ts" setup>
import { PageOpenModeEnum } from '@grow-admin-rock/constants'
import { RenderIframe } from '@grow-admin-rock/components/embed-page'
import { resolveTabCacheName, storeToRefs, useAppConfig, useTabStore } from '@grow-admin-rock/state'
import type { Component } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { useTabRouteSync } from '../tabs/use/useTabRouteSync'
import { wrapKeepAliveComponent } from './wrapKeepAliveComponent'

useTabRouteSync()

const tabStore = useTabStore()
const appConfig = useAppConfig()
const { cacheIncludeList, pageReloadKeys } = storeToRefs(tabStore)
const { canEmbedIFramePage } = storeToRefs(appConfig)

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
