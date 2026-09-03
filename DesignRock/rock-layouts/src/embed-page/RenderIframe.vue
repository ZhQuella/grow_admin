<template>
  <div class="iframe-stage h-full w-full">
    <template v-for="frame in framePages" :key="frame.key">
      <transition
        :name="pageTransitionName"
        :css="Boolean(pageTransitionName)"
      >
        <div
          v-show="showIframe(frame)"
          class="iframe-stage__item"
        >
          <FramePage
            v-if="isFrameLoaded(frame)"
            :key="getFrameKey(frame)"
            :src="frame.link"
            class="h-full w-full"
          />
        </div>
      </transition>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, watch } from 'vue'
import { PageOpenModeEnum } from '@grow-admin-rock/constants'
import { Lib as routeLib, useRoute } from '@grow-admin-rock/middleware-router'
import { resolveByKeyOrThrow } from '@grow-admin-rock/ioc'
import { normalizeTabPath, storeToRefs, useAppConfig, useTabStore } from '@grow-admin-rock/state'
import type { TabItem } from '@grow-admin-rock/types'
import FramePage from './FramePage.vue'
import '../content-view/page-transition.css'

interface IframeFrame {
  key: string
  fullPath: string
  link: string
}

const route = useRoute()
const tabStore = useTabStore()
const appConfig = useAppConfig()
const router = resolveByKeyOrThrow(routeLib.types.RouteTable).router
const { tabList, pageReloadKeys } = storeToRefs(tabStore)
const { transition } = storeToRefs(appConfig)

const pageTransitionName = computed(() =>
  transition.value.enable ? transition.value.basicTransition : undefined,
)

function currentPath() {
  return normalizeTabPath(route.fullPath)
}

function resolveIframeFrame(tab: TabItem): IframeFrame | null {
  if (tab.openMode === PageOpenModeEnum.IFRAME && tab.link) {
    const fullPath = normalizeTabPath(tab.fullPath)
    return {
      key: fullPath,
      fullPath,
      link: tab.link,
    }
  }

  const resolved = router.resolve(tab.fullPath)
  const link = (tab.link || resolved.meta?.link) as string | undefined
  const openMode = tab.openMode ?? resolved.meta?.openMode
  if (openMode === PageOpenModeEnum.IFRAME && link) {
    const fullPath = normalizeTabPath(tab.fullPath)
    return {
      key: fullPath,
      fullPath,
      link,
    }
  }

  return null
}

function resolveCurrentRouteFrame(): IframeFrame | null {
  const link = route.meta?.link as string | undefined
  if (route.meta?.openMode !== PageOpenModeEnum.IFRAME || !link) {
    return null
  }

  const fullPath = currentPath()
  return {
    key: fullPath,
    fullPath,
    link,
  }
}

const framePages = computed(() => {
  const frameMap = new Map<string, IframeFrame>()

  tabList.value.forEach((tab) => {
    const frame = resolveIframeFrame(tab)
    if (frame) {
      frameMap.set(frame.key, frame)
    }
  })

  const currentFrame = resolveCurrentRouteFrame()
  if (currentFrame) {
    frameMap.set(currentFrame.key, currentFrame)
  }

  return Array.from(frameMap.values())
})

const loadedFrameKeys = reactive<Record<string, true>>({})

function markFrameLoaded(key: string) {
  loadedFrameKeys[key] = true
}

function isFrameLoaded(frame: IframeFrame) {
  return Boolean(loadedFrameKeys[frame.key])
}

function getFrameKey(frame: IframeFrame) {
  const reloadKey = pageReloadKeys.value[frame.fullPath] ?? 0
  return `${frame.key}__${reloadKey}`
}

function syncLoadedFrameForRoute() {
  const frame = framePages.value.find((item) => item.fullPath === currentPath())
  if (frame) {
    markFrameLoaded(frame.key)
  }
}

watch(() => route.fullPath, syncLoadedFrameForRoute, { immediate: true })

watch(framePages, (frames) => {
  const activeKeys = new Set(frames.map((frame) => frame.key))
  for (const key of Object.keys(loadedFrameKeys)) {
    if (!activeKeys.has(key)) {
      delete loadedFrameKeys[key]
    }
  }
})

function showIframe(frame: IframeFrame) {
  return frame.fullPath === currentPath()
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'RenderIframe',
  components: {
    FramePage,
  },
})
</script>

<style scoped>
.iframe-stage {
  position: relative;
  overflow: hidden;
}

.iframe-stage__item {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
}
</style>
