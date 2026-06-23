<template>
  <div v-if="isShowFrame" class="h-full w-full">
    <div
      v-for="frame in framePages"
      :key="frame.key"
      v-show="showIframe(frame)"
      class="h-full w-full"
    >
      <FramePage :src="frame.link" class="h-full w-full" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { PageOpenModeEnum } from '@grow-admin-rock/constants'
import { Lib as routeLib, useRoute } from '@grow-admin-rock/middleware-router'
import { resolveByKeyOrThrow } from '@grow-admin-rock/ioc'
import { storeToRefs, useAppConfig, useTabStore } from '@grow-admin-rock/state'
import type { TabItem } from '@grow-admin-rock/types'
import { normalizePath } from './utils'
import FramePage from './FramePage.vue'

interface IframeFrame {
  key: string
  fullPath: string
  link: string
}

const route = useRoute()
const tabStore = useTabStore()
const appConfig = useAppConfig()
const router = resolveByKeyOrThrow(routeLib.types.RouteTable).router
const { tabList } = storeToRefs(tabStore)
const { canEmbedIFramePage } = storeToRefs(appConfig)

function resolveIframeFrame(tab: TabItem): IframeFrame | null {
  if (tab.link) {
    return {
      key: tab.fullPath,
      fullPath: normalizePath(tab.fullPath),
      link: tab.link,
    }
  }

  const resolved = router.resolve(tab.fullPath)
  const link = resolved.meta?.link as string | undefined
  if (resolved.meta?.openMode === PageOpenModeEnum.IFRAME && link) {
    return {
      key: tab.fullPath,
      fullPath: normalizePath(tab.fullPath),
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

  const fullPath = normalizePath(route.path)
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

function showIframe(frame: IframeFrame) {
  return frame.fullPath === normalizePath(route.path)
}

const isShowFrame = computed(() => {
  return canEmbedIFramePage.value && framePages.value.length > 0
})
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
