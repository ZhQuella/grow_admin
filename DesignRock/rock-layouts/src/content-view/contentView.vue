<template>
  <div class="relative h-full min-h-0 w-full overflow-hidden">
    <GrowWatchBox class="absolute inset-0 overflow-hidden">
      <template #default="{ height }">
        <GrowScrollbar
          v-if="height > 0"
          ref="contentScrollbarRef"
          :height="`${height}px`"
          @scroll="refreshContentScrollbar"
        >
          <div ref="pageViewStageRef" class="page-view-stage" :style="{
                  height: `${height}px`
                }">
            <router-view v-slot="{ Component, route: viewRoute }">
            <transition
              :name="pageTransitionName"
              :css="Boolean(pageTransitionName)"
              @after-enter="refreshContentScrollbar"
              @after-leave="refreshContentScrollbar"
            >
              <keep-alive :include="cacheIncludeList">
                <component
                  :is="resolveViewComponent(Component, viewRoute)"
                  v-if="Component"
                  :key="getComponentKey(viewRoute)"
                />
              </keep-alive>
            </transition>
          </router-view>
          <transition
            :name="pageTransitionName"
            :css="Boolean(pageTransitionName)"
            @after-enter="refreshContentScrollbar"
            @after-leave="refreshContentScrollbar"
          >
            <div
              v-if="canEmbedIFramePage"
              v-show="isCurrentRouteIframe"
              class="page-view-iframe"
              :style="{ height: `${height}px` }"
            >
              <RenderIframe class="h-full w-full" />
            </div>
          </transition>
          </div>
        </GrowScrollbar>
      </template>
    </GrowWatchBox>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { driverRef } from '@grow-admin-rock/components'
import { PageOpenModeEnum } from '@grow-admin-rock/constants'
import { useRoute } from '@grow-admin-rock/middleware-router'
import { RenderIframe } from '../embed-page'
import { resolveTabCacheName, normalizeTabPath, storeToRefs, useAppConfig, useTabStore } from '@grow-admin-rock/state'
import type { Component, VNode } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { useTabRouteSync } from '../tabs/use/useTabRouteSync'
import { wrapKeepAliveComponent } from './wrapKeepAliveComponent'
import './page-transition.css'

useTabRouteSync()

const route = useRoute()
const tabStore = useTabStore()
const appConfig = useAppConfig()
const contentScrollbarRef = ref()
const pageViewStageRef = ref<HTMLElement | null>(null)
let contentResizeObserver: ResizeObserver | undefined
let contentMutationObserver: MutationObserver | undefined
const { cacheIncludeList, pageReloadKeys } = storeToRefs(tabStore)
const { canEmbedIFramePage, transition } = storeToRefs(appConfig)

const pageTransitionName = computed(() =>
  transition.value.enable ? transition.value.basicTransition : undefined,
)

const isCurrentRouteIframe = computed(() => isIframeRoute(route))

function refreshContentScrollbar() {
  void nextTick(() => {
    const scrollbar = driverRef(contentScrollbarRef as any) as { update?: () => void } | undefined
    scrollbar?.update?.()
  })
}

function observePageContent() {
  contentResizeObserver?.disconnect()
  for (const element of pageViewStageRef.value?.children ?? []) {
    contentResizeObserver?.observe(element)
  }
}

watch(pageViewStageRef, (stage) => {
  contentResizeObserver?.disconnect()
  contentMutationObserver?.disconnect()
  if (!stage) return

  contentResizeObserver = new ResizeObserver(() => refreshContentScrollbar())
  contentMutationObserver = new MutationObserver(() => {
    observePageContent()
    refreshContentScrollbar()
  })
  contentMutationObserver.observe(stage, { childList: true })
  observePageContent()
  refreshContentScrollbar()
}, { flush: 'post' })

onBeforeUnmount(() => {
  contentResizeObserver?.disconnect()
  contentMutationObserver?.disconnect()
})

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

<style scoped>
.page-view-stage {
  position: relative;
}

.page-view-iframe {
  position: absolute;
  inset: 0;
  z-index: 1;
}
</style>
