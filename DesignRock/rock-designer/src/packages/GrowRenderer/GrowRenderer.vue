<template>
  <div ref="rootRef" class="grow-renderer" :style="pageStyle">
    <template v-if="structures.length">
      <RenderNode
        v-for="node in structures"
        :key="node.uuid"
        :node="node"
        :schema="resolvedSchema"
      />
    </template>
    <div v-else class="grow-renderer__empty">
      <slot name="empty">暂无内容</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onActivated,
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  onDeactivated,
  onErrorCaptured,
  onMounted,
  onUnmounted,
  onUpdated,
  provide,
  reactive,
  ref,
  watch,
  type WatchStopHandle,
} from 'vue'
import RenderNode from './components/RenderNode.vue'
import type { DesignerSchema } from './types'
import { GROW_RUNTIME_STATE } from '../GrowDesigner/config/designation'
import { buildRuntimeState, syncRuntimeState } from './utils/resolveBoundProps'
import { runDesignerEvent } from './utils/runDesignerEvent'
import { setupPageWatchers } from './utils/runDesignerWatcher'
import type { DesignerEventItem } from '../GrowDesigner/static/elementEvents/types'
import type { DesignerWatcherItem } from '../GrowDesigner/static/pageWatchers'

defineOptions({ name: 'GrowRenderer' })

const props = withDefaults(
  defineProps<{
    /** 设计器导出的页面 schema（structures + renderArgument + props + styles） */
    schema?: DesignerSchema | null
  }>(),
  {
    schema: null,
  },
)

const resolvedSchema = computed<DesignerSchema>(() => props.schema || {})

const structures = computed(() => resolvedSchema.value.structures || [])

/** 预览态可写 runtime state：绑定展示 + 控件变更回写 */
const runtimeState = reactive<Record<string, unknown>>({})
watch(
  () => resolvedSchema.value.dataSource,
  (ds) => {
    syncRuntimeState(runtimeState, buildRuntimeState(ds))
  },
  { deep: true, immediate: true },
)
provide(GROW_RUNTIME_STATE, runtimeState)

/** 供宿主读取表单双向绑定后的最新 state */
const getRuntimeState = () => runtimeState

defineExpose({
  runtimeState,
  getRuntimeState,
})

const pageStyle = computed(() => {
  const page = resolvedSchema.value.pageConfig || {}
  const style = page.style || page.styles || {}
  return typeof style === 'object' ? style : {}
})

const pageEvents = computed(
  () =>
    ((resolvedSchema.value.pageConfig as any)?.events || {}) as Record<
      string,
      DesignerEventItem
    >,
)

const pageWatchers = computed(
  () =>
    ((resolvedSchema.value.pageConfig as any)?.watchers || {}) as Record<
      string,
      DesignerWatcherItem
    >,
)

const runPageLifecycle = (eventType: string, event?: unknown) => {
  const item = pageEvents.value?.[eventType]
  if (!item) return
  runDesignerEvent(item, event, runtimeState)
}

/** 页面 state 监听：配置变更时重建 */
let stopPageWatchers: WatchStopHandle | null = null
const rebuildPageWatchers = () => {
  stopPageWatchers?.()
  stopPageWatchers = setupPageWatchers(pageWatchers.value, runtimeState)
}
watch(pageWatchers, rebuildPageWatchers, { deep: true, immediate: true })

/** 根节点实测高度，供子项 % 高度换算 */
const rootRef = ref<HTMLElement | null>(null)
let rootObserver: ResizeObserver | null = null

const syncRendererHeightVar = () => {
  const el = rootRef.value
  if (!el) return
  el.style.setProperty('--grow-renderer-height', `${el.clientHeight}px`)
}

onBeforeMount(() => {
  runPageLifecycle('onBeforeMount')
})

onMounted(() => {
  syncRendererHeightVar()
  if (typeof ResizeObserver !== 'undefined' && rootRef.value) {
    rootObserver = new ResizeObserver(() => syncRendererHeightVar())
    rootObserver.observe(rootRef.value)
  }
  runPageLifecycle('onMounted')
})

onBeforeUpdate(() => {
  runPageLifecycle('onBeforeUpdate')
})

onUpdated(() => {
  runPageLifecycle('onUpdated')
})

onActivated(() => {
  runPageLifecycle('onActivated')
})

onDeactivated(() => {
  runPageLifecycle('onDeactivated')
})

onErrorCaptured((err) => {
  runPageLifecycle('onErrorCaptured', err)
  return true
})

onBeforeUnmount(() => {
  runPageLifecycle('onBeforeUnmount')
  stopPageWatchers?.()
  stopPageWatchers = null
  rootObserver?.disconnect()
  rootObserver = null
})

onUnmounted(() => {
  runPageLifecycle('onUnmounted')
})
</script>

<style scoped>
.grow-renderer {
  box-sizing: border-box;
  /* 保持文档流，避免 flex 把行内组件（按钮/链接等）块级化 */
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: auto;
  padding: 16px;
  background: var(--layout-container-background-color, #fff);
}

.grow-renderer__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  font-size: 13px;
  color: var(--text-color-secondary, #909399);
}
</style>
