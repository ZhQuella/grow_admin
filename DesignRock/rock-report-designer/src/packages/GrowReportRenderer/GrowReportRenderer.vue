<template>
  <div class="box-border h-full min-h-0 w-full overflow-auto">
    <GridLayout
      v-if="renderLayout.length"
      :key="gridLayoutKey"
      v-model:layout="renderLayout"
      class="grow-report-grid"
      :col-num="gridConfig.colNum"
      :row-height="gridConfig.rowHeight"
      :max-rows="gridConfig.maxRows"
      :margin="gridConfig.margin"
      :is-draggable="gridConfig.isDraggable"
      :is-resizable="gridConfig.isResizable"
      :is-mirrored="gridConfig.isMirrored"
      :is-bounded="gridConfig.isBounded"
      :auto-size="gridConfig.autoSize"
      :vertical-compact="gridConfig.verticalCompact"
      :restore-on-drag="gridConfig.restoreOnDrag"
      :prevent-collision="gridConfig.preventCollision"
      :use-css-transforms="gridConfig.useCssTransforms"
      :responsive="gridConfig.responsive"
      :breakpoints="gridConfig.breakpoints"
      :cols="gridConfig.cols"
      :use-style-cursor="gridConfig.useStyleCursor"
      :transform-scale="gridConfig.transformScale"
    >
      <GridItem
        v-for="item in renderLayout"
        :key="item.i"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
      >
        <GrowCard class="report-block-card flex h-full flex-col overflow-hidden">
          <template v-if="item.showTitle" #header>
            <span>{{ item.title }}</span>
          </template>
          <ReportBlockChart
            class="min-h-0 flex-1"
            :chart-type="item.chartType"
            :chart-config="item.chartConfig"
            :data-binding="item.dataBinding"
          />
        </GrowCard>
      </GridItem>
    </GridLayout>
    <div v-else class="flex-center h-full min-h-60 w-full">
      <GrowEmpty>
        <slot name="empty">暂无内容</slot>
      </GrowEmpty>
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
} from 'vue'
import { GridItem, GridLayout } from 'vue3-grid-layout'
import {
  GROW_RUNTIME_STATE,
  buildRuntimeState,
  syncRuntimeState,
  runApiOutlinedList,
  recomputeComputedProps,
  runDesignerEvent,
  type DesignerEventItem,
  type ReportHttpClient,
} from '@grow-admin-rock/designer'
import ReportBlockChart from './components/ReportBlockChart.vue'
import {
  resolveReportGridConfig,
  type ReportLayoutItem,
  type ReportSchema,
} from './types'
import { cloneDeep } from '@grow-admin-rock/utils'

defineOptions({
  name: 'GrowReportRenderer',
})

const props = withDefaults(
  defineProps<{
    /** 设计器导出的报表 schema（layout + pageConfig + 页面数据） */
    schema?: ReportSchema | null
    /** 宿主注入的 HTTP 客户端；缺省原生 fetch */
    httpClient?: ReportHttpClient | null
  }>(),
  {
    schema: null,
    httpClient: null,
  },
)

const resolvedSchema = computed<ReportSchema>(() => props.schema || {})

/** GridLayout 可能改写坐标，使用副本，避免污染外部 schema */
const renderLayout = ref<ReportLayoutItem[]>([])

watch(
  () => resolvedSchema.value.layout,
  (list) => {
    renderLayout.value = cloneDeep(list || [])
  },
  { deep: true, immediate: true },
)

/** 与设计器画布同一套 pageConfig → GridLayout props */
const gridConfig = computed(() =>
  resolveReportGridConfig(resolvedSchema.value.pageConfig),
)

/** 部分 GridLayout props 变更需重挂载才生效（如 isMirrored） */
const gridLayoutKey = computed(() => {
  const cfg = gridConfig.value
  return [
    cfg.colNum,
    cfg.rowHeight,
    cfg.isMirrored,
    cfg.isDraggable,
    cfg.isResizable,
    cfg.responsive,
    cfg.useCssTransforms,
    cfg.transformScale,
    cfg.margin.join(','),
  ].join('|')
})

const runtimeState = reactive<Record<string, unknown>>({})
let apiRunToken = 0

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
    httpClient: props.httpClient || undefined,
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

const pageEvents = computed(
  () =>
    (resolvedSchema.value.pageConfig?.events || {}) as Record<
      string,
      DesignerEventItem
    >,
)

const runPageLifecycle = (eventType: string, event?: unknown) => {
  const item = pageEvents.value?.[eventType]
  if (!item) return
  runDesignerEvent(item, event, runtimeState)
}

onBeforeMount(() => {
  runPageLifecycle('onBeforeMount')
})

onMounted(() => {
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
})

onUnmounted(() => {
  runPageLifecycle('onUnmounted')
})

defineExpose({
  runtimeState,
  refreshApiOutlined: rebuildRuntimeState,
})
</script>

<style scoped>
:deep(.grow-report-grid > .vue-grid-item) {
  overflow: hidden;
}

:deep(.grow-report-grid > .vue-grid-item.vue-grid-placeholder) {
  background: var(--primary-color) !important;
  opacity: 0.2;
  border-radius: 4px;
}

:deep(.grow-report-grid > .vue-grid-item > .vue-resizable-handle) {
  z-index: 20;
  position: absolute;
  width: 8px;
  height: 8px;
  left: auto !important;
  right: 3px !important;
  bottom: 3px !important;
  padding: 0;
  background: none !important;
  border-right: 1.5px solid var(--primary-color);
  border-bottom: 1.5px solid var(--primary-color);
  opacity: 0.85;
  cursor: se-resize;
  pointer-events: auto;
}

.report-block-card :deep(.el-card__header),
.report-block-card :deep(.n-card-header),
.report-block-card :deep(.ant-card-head) {
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.4;
}

.report-block-card :deep(.el-card__body),
.report-block-card :deep(.n-card__content),
.report-block-card :deep(.ant-card-body) {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: 10px;
}
</style>
