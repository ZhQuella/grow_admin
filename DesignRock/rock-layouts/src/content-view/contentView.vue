<template>
  <div class="relative h-full min-h-0 w-full overflow-hidden">
    <GrowWatchBox class="absolute inset-0 overflow-hidden">
      <template #default="{ height }">
        <GrowScrollbar v-if="height > 0" :height="`${height}px`">
          <div :style="{
                  height: `${height}px`
                }">
            <router-view v-slot="{ Component, route: viewRoute }">
            <keep-alive :include="cacheIncludeList">
              <component
                :is="resolveViewComponent(Component, viewRoute)"
                v-if="Component"
                v-show="!isIframeRoute(viewRoute)"
                :key="getComponentKey(viewRoute)"
              />
            </keep-alive>
          </router-view>
          <RenderIframe
            v-if="canEmbedIFramePage"
            v-show="isCurrentRouteIframe"
            class="h-full w-full"
            :style="{ height: `${height}px` }"
          />
          </div>
        </GrowScrollbar>
      </template>
    </GrowWatchBox>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { PageOpenModeEnum } from '@grow-admin-rock/constants'
import { useRoute } from '@grow-admin-rock/middleware-router'
import { RenderIframe } from '../embed-page'
import { resolveTabCacheName, normalizeTabPath, storeToRefs, useAppConfig, useTabStore } from '@grow-admin-rock/state'
import type { Component, VNode } from 'vue'
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
  return String(route.name)
}

function resolveRouteCacheName(route: RouteLocationNormalizedLoaded) {
  const normalizedPath = normalizeTabPath(route.fullPath)
  const cacheNameFromStore = tabStore.getTabCacheName(normalizedPath)
  if (cacheNameFromStore) {
    return cacheNameFromStore
  }
  return resolveTabCacheName(normalizedPath, resolveRouteCacheBaseName(route))
}

function resolveViewComponent(
  component: Component | VNode | null,
  viewRoute: RouteLocationNormalizedLoaded,
) {
  if (!component) {
    return null
  }
  return wrapKeepAliveComponent(component, resolveRouteCacheName(viewRoute))
}

function getComponentKey(route: RouteLocationNormalizedLoaded) {
  const normalizedPath = normalizeTabPath(route.fullPath)
  const reloadKey = pageReloadKeys.value[normalizedPath] ?? 0
  return `${resolveRouteCacheName(route)}__${reloadKey}`
}

function isIframeRoute(route: RouteLocationNormalizedLoaded) {
  return route.meta?.openMode === PageOpenModeEnum.IFRAME && Boolean(route.meta?.link)
}
</script>
