<template>
  <div
    class="absolute inset-0 flex h-auto w-auto min-h-0 flex-col overflow-hidden bg-layout"
    @click="onDeselect"
  >
    <div
      class="box-border flex h-10 w-full shrink-0 items-center justify-between gap-3 border-b border-solid border-border bg-component px-3"
      @click.stop
    >
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <GrowButton size="small" type="primary" @click="onAddBlock">
          <GrowIconify icon="carbon:add" :size="14" class="mr-1 align-[-2px]" />
          添加区块
        </GrowButton>
        <GrowButton class="!ml-0" size="small" :disabled="!layout.length" @click="onClearCanvas">
          <GrowIconify icon="carbon:erase" :size="14" class="mr-1 align-[-2px]" />
          清空
        </GrowButton>
        <span class="ml-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-text-secondary">
          左侧配置页面数据；悬停区块可配置、复制或删除
        </span>
      </div>
      <GrowButton size="small" type="primary" @click="onPreview">
        <GrowIconify icon="carbon:play" :size="14" class="mr-1 align-[-2px]" />
        预览
      </GrowButton>
    </div>

    <GrowDrawer
      v-model="previewVisible"
      title="报表预览"
      direction="btt"
      placement="bottom"
      size="90%"
      height="90%"
      :destroy-on-close="true"
      @click.stop
    >
      <div class="box-border h-full min-h-0 w-full overflow-hidden p-3">
        <GrowReportRenderer :schema="previewSchema">
          <template #empty>
            <p>暂无区块</p>
          </template>
        </GrowReportRenderer>
      </div>
    </GrowDrawer>

    <div class="relative flex min-h-0 flex-1 overflow-hidden">
      <aside class="report-rail" @click.stop>
        <GrowTooltip
          v-for="item in railItems"
          :key="item.type"
          :content="item.label"
          placement="right"
        >
          <div
            class="report-rail-item"
            :class="{
              'is-active': pagePanel.visible && pagePanel.type === item.type,
            }"
            role="button"
            tabindex="0"
            :aria-label="item.label"
            @click="onRailClick(item.type)"
            @keydown.enter.prevent="onRailClick(item.type)"
            @keydown.space.prevent="onRailClick(item.type)"
          >
            <GrowIconify :icon="item.icon" :size="18" class="report-rail-icon" />
          </div>
        </GrowTooltip>
      </aside>

      <div
        v-if="pagePanel.visible"
        class="relative z-20 w-[300px] shrink-0 border-r border-solid border-border bg-component"
        @click.stop
      >
        <div
          class="box-border flex h-10 items-center justify-between border-b border-solid border-border px-3"
        >
          <h4 class="m-0 text-[13px] font-semibold text-text">{{ pagePanel.title }}</h4>
          <GrowButton text size="small" class="!px-1" title="关闭" @click="onClosePagePanel">
            <GrowIconify icon="carbon:close" :size="15" />
          </GrowButton>
        </div>
        <div class="absolute bottom-0 left-0 right-0 top-10 overflow-visible">
          <component :is="pagePanel.componentName" :data="pageData" class="h-full" />
        </div>
      </div>

      <div class="report-designer-canvas relative box-border min-h-0 min-w-0 flex-1 overflow-auto p-3">
        <!-- 预览时卸载画布 GridLayout：vue3-grid-layout 全局 eventBus 会串扰宽度/列数 -->
        <GridLayout
          v-if="layout.length && !previewVisible"
          v-model:layout="layout"
          class="grow-report-grid"
          :col-num="gridConfig.colNum"
          :row-height="gridConfig.rowHeight"
          :max-rows="gridConfig.maxRows"
          :margin="gridConfig.margin"
          :is-draggable="true"
          :is-resizable="true"
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
          :use-style-cursor="true"
          :transform-scale="gridConfig.transformScale"
        >
          <GridItem
            v-for="item in layout"
            :key="item.i"
            :x="item.x"
            :y="item.y"
            :w="item.w"
            :h="item.h"
            :i="item.i"
            @click.stop="onSelect(item.i)"
            @move="onItemMove"
            @moved="onItemInteractEnd"
            @resize="onItemResize"
            @resized="onItemInteractEnd"
          >
            <div
              class="group relative box-border h-full w-full cursor-pointer select-none"
              :class="{
                'is-active outline outline-1 -outline-offset-1 outline-primary':
                  activeId === item.i,
              }"
            >
              <div
                class="absolute right-0 top-0 z-20 hidden h-[26px] items-center gap-0.5 rounded-bl-lg rounded-tr bg-primary px-1 py-0 pl-0.5 text-white group-hover:inline-flex group-[.is-active]:inline-flex"
              >
                <GrowIconify
                  class="inline-flex h-[22px] w-[22px] items-center justify-center rounded text-white opacity-90 hover:bg-white/18 hover:opacity-100"
                  icon="carbon:settings"
                  :size="13"
                  hover-pointer
                  title="报表配置"
                  @click.stop="onOpenConfig(item.i)"
                  @mousedown.stop
                />
                <GrowIconify
                  class="inline-flex h-[22px] w-[22px] items-center justify-center rounded text-white opacity-90 hover:bg-white/18 hover:opacity-100"
                  icon="carbon:copy"
                  :size="13"
                  hover-pointer
                  title="复制区块"
                  @click.stop="onCopyBlock(item.i)"
                  @mousedown.stop
                />
                <GrowIconify
                  class="inline-flex h-[22px] w-[22px] items-center justify-center rounded text-white opacity-90 hover:bg-[rgba(237,111,111,0.45)] hover:opacity-100"
                  icon="carbon:trash-can"
                  :size="13"
                  hover-pointer
                  title="删除区块"
                  @click.stop="onDeleteBlock(item.i)"
                  @mousedown.stop
                />
              </div>
              <div
                v-if="dragHint?.i === item.i"
                class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
              >
                <div
                  class="rounded-md bg-[rgba(0,0,0,0.62)] px-2.5 py-1.5 text-center text-white shadow-sm backdrop-blur-[2px]"
                >
                  <div class="text-sm font-semibold leading-tight tracking-wide">
                    {{ dragHint.shareText }}
                  </div>
                  <div class="mt-0.5 text-[11px] leading-tight opacity-85">
                    {{ dragHint.sizeText }}
                  </div>
                </div>
              </div>
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
            </div>
          </GridItem>
        </GridLayout>

        <div v-else class="flex-center h-full min-h-60 w-full">
          <GrowEmpty description="点击上方「添加区块」开始设计" />
        </div>
      </div>

      <aside
        v-if="configVisible && configItem"
        class="absolute bottom-2.5 right-2.5 top-2.5 z-30 box-border flex w-[420px] min-h-0 flex-col overflow-hidden rounded-md border border-solid border-border bg-component shadow-[rgba(0,0,0,0.08)_-4px_0_16px]"
        @click.stop
      >
        <div
          class="box-border flex h-10 w-full shrink-0 flex-nowrap items-center border-b border-solid border-border py-0 pl-3 pr-2"
        >
          <h4
            class="m-0 min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold leading-[30px] text-text"
          >
            {{ configPanelTitle }}
          </h4>
          <div class="ml-auto flex w-auto shrink-0 flex-nowrap items-center justify-end p-0">
            <GrowButton
              text
              size="small"
              class="!h-7 !max-w-7 !min-w-7 !w-7 !shrink-0 !p-0 text-text-secondary"
              title="关闭"
              @click="onCloseConfig"
            >
              <GrowIconify icon="carbon:close" :size="15" />
            </GrowButton>
          </div>
        </div>
        <div class="min-h-0 flex-1 overflow-auto">
          <BlockConfigPanel
            :item="configItem"
            :variable-options="variableOptions"
            @change="onConfigChange"
          />
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, provide, reactive, ref, watch } from 'vue'
import { GridItem, GridLayout } from 'vue3-grid-layout'
import {
  DesignerDataSourcePanel,
  DesignerComputedPropsPanel,
  DesignerApiOutlinedPanel,
  DesignerPageEventsPanel,
  GROW_RUNTIME_STATE,
  buildRuntimeState,
  syncRuntimeState,
  runApiOutlinedList,
  recomputeComputedProps,
} from '@grow-admin-rock/designer'
import {
  GrowReportRenderer,
  createReportSchema,
  createDefaultPageConfig,
  resolveReportGridConfig,
  type ReportSchema,
  type ReportPageConfig,
} from '../GrowReportRenderer'
import ReportBlockChart from '../GrowReportRenderer/components/ReportBlockChart.vue'
import BlockConfigPanel from './components/BlockConfigPanel.vue'
import PageConfigPanel from './components/PageConfigPanel.vue'
import {
  copyLayoutItem,
  createLayoutItem,
  type ReportLayoutItem,
} from './static/layout'

defineOptions({
  name: 'GrowReportDesigner',
})

const layout = ref<ReportLayoutItem[]>([])
const activeId = ref('')
const previewVisible = ref(false)
const previewSchema = ref<ReportSchema | null>(null)
const configVisible = ref(false)
const configId = ref('')
const dragHint = ref<{
  i: string
  shareText: string
  sizeText: string
} | null>(null)
let blockSeq = 0

const pageData = reactive({
  pageConfig: createDefaultPageConfig() as ReportPageConfig,
  dataSource: [] as any[],
  computedProps: [] as any[],
  apiOutlined: [] as any[],
})

const railItems = [
  {
    type: 'pageConfig',
    label: '页面配置',
    icon: 'carbon:grid',
    componentName: 'PageConfigPanel',
    title: '页面配置',
  },
  {
    type: 'dataBin',
    label: '数据源',
    icon: 'carbon:data-bin',
    componentName: 'DesignerDataSourcePanel',
    title: '数据源',
  },
  {
    type: 'computedProps',
    label: '属性计算',
    icon: 'carbon:function',
    componentName: 'DesignerComputedPropsPanel',
    title: '属性计算',
  },
  {
    type: 'pageEvents',
    label: '页面事件',
    icon: 'carbon:lightning',
    componentName: 'DesignerPageEventsPanel',
    title: '页面事件',
  },
  {
    type: 'apiOutlined',
    label: '数据请求',
    icon: 'carbon:api',
    componentName: 'DesignerApiOutlinedPanel',
    title: '数据请求',
  },
] as const

const gridConfig = computed(() => resolveReportGridConfig(pageData.pageConfig))

const pagePanel = reactive({
  visible: false,
  type: '' as string,
  title: '',
  componentName: '' as string,
})

const onRailClick = (type: string) => {
  const target = railItems.find((item) => item.type === type)
  if (!target) return
  if (pagePanel.visible && pagePanel.type === type) {
    pagePanel.visible = false
    pagePanel.type = ''
    return
  }
  pagePanel.visible = true
  pagePanel.type = target.type
  pagePanel.title = target.title
  pagePanel.componentName = target.componentName
}

const onClosePagePanel = () => {
  pagePanel.visible = false
  pagePanel.type = ''
}

const runtimeState = reactive<Record<string, unknown>>({})
let apiRunToken = 0

const rebuildRuntimeState = async () => {
  const token = ++apiRunToken
  syncRuntimeState(
    runtimeState,
    buildRuntimeState(pageData.dataSource, pageData.computedProps),
  )
  await runApiOutlinedList(pageData.apiOutlined, runtimeState, { autoLoadOnly: true })
  if (token !== apiRunToken) return
  recomputeComputedProps(pageData.computedProps, runtimeState)
}

watch(
  () => [pageData.dataSource, pageData.computedProps, pageData.apiOutlined] as const,
  () => {
    void rebuildRuntimeState()
  },
  { deep: true, immediate: true },
)

provide(GROW_RUNTIME_STATE, runtimeState)

const variableOptions = computed(() => {
  const names = new Set<string>()
  ;[
    ...(pageData.dataSource || []),
    ...(pageData.computedProps || []),
    ...(pageData.apiOutlined || []),
  ].forEach((item: any) => {
    const name = String(item?.name ?? '').trim()
    if (name) names.add(name)
  })
  return [...names].map((name) => ({
    label: `state.${name}`,
    value: `state.${name}`,
  }))
})

const configItem = computed(
  () => layout.value.find((item) => item.i === configId.value) ?? null,
)

const configPanelTitle = computed(() =>
  configItem.value ? `报表配置 · ${configItem.value.title}` : '报表配置',
)

const formatDragHint = (i: string, w: number, h: number) => {
  const share = (Math.max(w, 0) / gridConfig.value.colNum) * 100
  return {
    i,
    shareText: Number.isInteger(share) ? `${share}%` : `${share.toFixed(1)}%`,
    sizeText: `${w} × ${h}`,
  }
}

const showDragHint = (i: string, w: number, h: number) => {
  dragHint.value = formatDragHint(i, w, h)
}

const onItemMove = (i: string | number) => {
  const id = String(i)
  const item = layout.value.find((entry) => entry.i === id)
  if (!item) return
  showDragHint(id, item.w, item.h)
}

const onItemResize = (i: string | number, h: number, w: number) => {
  showDragHint(String(i), w, h)
}

const onItemInteractEnd = () => {
  dragHint.value = null
}

const onSelect = (id: string) => {
  activeId.value = id
}

const onDeselect = () => {
  activeId.value = ''
}

const onAddBlock = () => {
  blockSeq += 1
  const id = `block-${blockSeq}`
  layout.value = [
    ...layout.value,
    createLayoutItem(layout.value, id, blockSeq, gridConfig.value.colNum),
  ]
  activeId.value = id
}

const onOpenConfig = (id: string) => {
  activeId.value = id
  configId.value = id
  configVisible.value = true
}

const onCloseConfig = () => {
  configVisible.value = false
  configId.value = ''
}

const onConfigChange = (
  patch: Partial<
    Pick<ReportLayoutItem, 'title' | 'showTitle' | 'chartType' | 'chartConfig' | 'dataBinding'>
  >,
) => {
  if (!configId.value) return
  layout.value = layout.value.map((item) =>
    item.i === configId.value ? { ...item, ...patch } : item,
  )
}

const onDeleteBlock = (id: string) => {
  layout.value = layout.value.filter((item) => item.i !== id)
  if (activeId.value === id) activeId.value = ''
  if (configId.value === id) {
    configId.value = ''
    configVisible.value = false
  }
}

const onCopyBlock = (id: string) => {
  const source = layout.value.find((item) => item.i === id)
  if (!source) return
  blockSeq += 1
  const nextId = `block-${blockSeq}`
  const copied = copyLayoutItem(layout.value, source, nextId, gridConfig.value.colNum)
  layout.value = [...layout.value, copied]
  activeId.value = nextId
}

const onClearCanvas = () => {
  if (!layout.value.length) return
  layout.value = []
  activeId.value = ''
  configId.value = ''
  configVisible.value = false
}

const buildSchema = () =>
  createReportSchema(layout.value, pageData.pageConfig, {
    dataSource: pageData.dataSource,
    apiOutlined: pageData.apiOutlined,
    computedProps: pageData.computedProps,
  })

const onPreview = () => {
  const schema = buildSchema()
  // 预览固定设计列数：抽屉宽度与画布不同，若开响应式会切到其它断点列数
  previewSchema.value = {
    ...schema,
    pageConfig: {
      ...schema.pageConfig,
      responsive: false,
    },
  }
  previewVisible.value = true
}

defineExpose({
  getSchema: buildSchema,
  runtimeState,
  refreshApiOutlined: rebuildRuntimeState,
})
</script>

<script lang="ts">
export default defineComponent({
  name: 'GrowReportDesigner',
  components: {
    DesignerDataSourcePanel,
    DesignerComputedPropsPanel,
    DesignerApiOutlinedPanel,
    DesignerPageEventsPanel,
    PageConfigPanel,
  },
})
</script>

<style scoped>
.report-rail {
  box-sizing: border-box;
  flex: 0 0 50px;
  width: 50px;
  min-width: 50px;
  height: 100%;
  padding: 5px;
  border-right: 1px solid var(--layout-border-color, var(--border-color));
  background: var(--component-background-color);
  overflow: visible;
  z-index: 20;
}

.report-rail-item {
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 0 auto 5px;
  border-radius: 4px;
  color: var(--text-color-secondary);
  cursor: pointer;
  user-select: none;
  transition: color 0.15s ease;
}

.report-rail-item:last-child {
  margin-bottom: 0;
}

.report-rail-item:hover,
.report-rail-item.is-active {
  color: var(--primary-color);
}

.report-rail-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.report-rail-item :deep(.grow-iconify) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  line-height: 0;
  color: inherit;
}

.report-rail-item :deep(.grow-iconify svg) {
  display: block;
  width: 18px;
  height: 18px;
  fill: currentColor;
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

.report-designer-canvas :deep(.grow-report-grid > .vue-grid-item) {
  overflow: hidden;
}

.report-designer-canvas :deep(.grow-report-grid > .vue-grid-item.vue-grid-placeholder) {
  background: var(--primary-color);
  opacity: 0.2;
  border-radius: 4px;
}

.report-designer-canvas :deep(.grow-report-grid > .vue-grid-item > .vue-resizable-handle) {
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
</style>
