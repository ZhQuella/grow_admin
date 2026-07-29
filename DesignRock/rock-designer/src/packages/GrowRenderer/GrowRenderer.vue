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
import { GROW_RUNTIME_STATE, GROW_RUNTIME_APIS } from '../GrowDesigner/config/designation'
import { buildRuntimeState, syncRuntimeState } from './utils/resolveBoundProps'
import {
  recomputeComputedProps,
  runApiOutlinedList,
  buildApiOutlinedMethods,
  setupComputedPropReactivity,
  resolveDesignerHttpClient,
  type ReportHttpClient,
  type ApiOutlinedMethods,
} from './utils/runApiOutlined'
import { runDesignerEvent } from './utils/runDesignerEvent'
import { setupPageWatchers } from './utils/runDesignerWatcher'
import type { DesignerEventItem } from '../GrowDesigner/static/elementEvents/types'
import type { DesignerWatcherItem } from '../GrowDesigner/static/pageWatchers'

defineOptions({ name: 'GrowRenderer' })

const props = withDefaults(
  defineProps<{
    /** 设计器导出的页面 schema（structures + renderArgument + props + styles） */
    schema?: DesignerSchema | null
    /** 宿主注入的 HTTP 客户端（数据请求用）；缺省走 infrastructure Axios */
    httpClient?: ReportHttpClient | null
  }>(),
  {
    schema: null,
    httpClient: null,
  },
)

const resolvedSchema = computed<DesignerSchema>(() => props.schema || {})

const structures = computed(() => resolvedSchema.value.structures || [])

/** 预览态可写 runtime state：绑定展示 + 控件变更回写 */
const runtimeState = reactive<Record<string, unknown>>({})

let apiRunToken = 0

const runtimeHttpClient = computed(() =>
  resolveDesignerHttpClient(props.httpClient),
)

const rebuildRuntimeState = async () => {
  const token = ++apiRunToken
  syncRuntimeState(
    runtimeState,
    buildRuntimeState(
      resolvedSchema.value.dataSource,
      resolvedSchema.value.computedProps,
    ),
  )
  await runApiOutlinedList(resolvedSchema.value.apiOutlined, runtimeState, {
    httpClient: runtimeHttpClient.value,
    autoLoadOnly: true,
  })
  if (token !== apiRunToken) return
  recomputeComputedProps(resolvedSchema.value.computedProps, runtimeState)
}

watch(
  () =>
    [
      resolvedSchema.value.dataSource,
      resolvedSchema.value.computedProps,
      resolvedSchema.value.apiOutlined,
    ] as const,
  () => {
    void rebuildRuntimeState()
  },
  { deep: true, immediate: true },
)
provide(GROW_RUNTIME_STATE, runtimeState)

/** 依赖字段变化时自动重算计算属性 */
setupComputedPropReactivity(
  runtimeState,
  () => resolvedSchema.value.computedProps,
)

/** 数据请求 → 事件可调用方法（配置名称即方法名） */
const apiMethods = computed<ApiOutlinedMethods>(() =>
  buildApiOutlinedMethods(resolvedSchema.value.apiOutlined, runtimeState, {
    httpClient: runtimeHttpClient.value,
    computedProps: resolvedSchema.value.computedProps,
  }),
)
provide(GROW_RUNTIME_APIS, apiMethods)

/** 供宿主读取表单双向绑定后的最新 state */
const getRuntimeState = () => runtimeState

/** 手动刷新全部 autoLoad 数据请求 */
const refreshApiOutlined = () => rebuildRuntimeState()

defineExpose({
  runtimeState,
  getRuntimeState,
  refreshApiOutlined,
  apiMethods,
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
  void runDesignerEvent(item, event, runtimeState, apiMethods.value)
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
