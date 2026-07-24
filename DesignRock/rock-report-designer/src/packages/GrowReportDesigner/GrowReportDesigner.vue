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
        <GrowButton size="small" :disabled="!layout.length" @click="onClearCanvas">
          <GrowIconify icon="carbon:erase" :size="14" class="mr-1 align-[-2px]" />
          清空
        </GrowButton>
        <span class="ml-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-text-secondary">
          悬停区块可删除，拖拽可调整位置与大小
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

    <div class="relative min-h-0 flex-1 overflow-hidden">
      <div class="report-designer-canvas relative box-border h-full min-h-0 w-full overflow-auto p-3">
        <GridLayout
          v-if="layout.length"
          v-model:layout="layout"
          class="grow-report-grid"
          :col-num="REPORT_GRID_COL_NUM"
          :row-height="REPORT_GRID_ROW_HEIGHT"
          :is-draggable="true"
          :is-resizable="true"
          :vertical-compact="true"
          :use-css-transforms="true"
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
          >
            <div
              class="group relative box-border h-full w-full cursor-pointer select-none"
              :class="{ 'is-active outline outline-1 -outline-offset-1 outline-primary': activeId === item.i }"
            >
              <div
                class="absolute right-0 top-0 z-20 hidden h-[26px] items-center gap-0.5 rounded-bl-lg rounded-tr bg-primary px-1 py-0 pl-0.5 text-white group-hover:inline-flex group-[.is-active]:inline-flex"
              >
                <button
                  type="button"
                  class="m-0 inline-flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded border-none bg-transparent p-0 leading-none text-white opacity-90 hover:bg-white/18 hover:opacity-100"
                  title="报表配置"
                  @click.stop="onOpenConfig(item.i)"
                  @mousedown.stop
                >
                  <GrowIconify icon="carbon:settings" :size="13" class="flex-center h-[13px] w-[13px]" />
                </button>
                <button
                  type="button"
                  class="m-0 inline-flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded border-none bg-transparent p-0 leading-none text-white opacity-90 hover:bg-[rgba(237,111,111,0.45)] hover:opacity-100"
                  title="删除区块"
                  @click.stop="onDeleteBlock(item.i)"
                  @mousedown.stop
                >
                  <GrowIconify icon="carbon:trash-can" :size="13" class="flex-center h-[13px] w-[13px]" />
                </button>
              </div>
              <GrowCard class="report-block-card flex h-full flex-col overflow-hidden">
                <template v-if="item.showTitle" #header>
                  <span>{{ item.title }}</span>
                </template>
                <div class="box-border h-full min-h-0 w-full" />
              </GrowCard>
            </div>
          </GridItem>
        </GridLayout>

        <div v-else class="flex-center h-full min-h-60 w-full">
          <div class="text-center text-text-secondary">
            <GrowIconify icon="carbon:grid" :size="56" class="mb-3 opacity-45" />
            <p class="m-0 text-sm">点击上方「添加区块」开始设计</p>
          </div>
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
            <button
              type="button"
              class="m-0 inline-flex h-7 max-w-7 min-w-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent p-0 leading-none text-text-secondary hover:bg-layout hover:text-text"
              title="关闭"
              @click="onCloseConfig"
            >
              <GrowIconify icon="carbon:close" :size="15" class="flex-center h-[15px] w-[15px]" />
            </button>
          </div>
        </div>
        <div class="min-h-0 flex-1 overflow-auto">
          <BlockConfigPanel :item="configItem" @change="onConfigChange" />
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { GridItem, GridLayout } from 'vue3-grid-layout'
import {
  GrowReportRenderer,
  createReportSchema,
  type ReportSchema,
} from '../GrowReportRenderer'
import BlockConfigPanel from './components/BlockConfigPanel.vue'
import {
  REPORT_GRID_COL_NUM,
  REPORT_GRID_ROW_HEIGHT,
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
let blockSeq = 0

const configItem = computed(() =>
  layout.value.find((item) => item.i === configId.value) ?? null,
)

const configPanelTitle = computed(() =>
  configItem.value ? `报表配置 · ${configItem.value.title}` : '报表配置',
)

const onSelect = (id: string) => {
  activeId.value = id
}

const onDeselect = () => {
  activeId.value = ''
}

const onAddBlock = () => {
  blockSeq += 1
  const id = `block-${blockSeq}`
  layout.value = [...layout.value, createLayoutItem(layout.value, id, blockSeq)]
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
  patch: Partial<Pick<ReportLayoutItem, 'title' | 'showTitle' | 'chartType'>>,
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

const onClearCanvas = () => {
  if (!layout.value.length) return
  layout.value = []
  activeId.value = ''
  configId.value = ''
  configVisible.value = false
}

const onPreview = () => {
  previewSchema.value = createReportSchema(layout.value)
  previewVisible.value = true
}
</script>

<style scoped>
/* 第三方组件内部结构，保留最小深度选择器 */
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
  flex: 1;
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
  right: 3px;
  bottom: 3px;
  padding: 0;
  background: none;
  border-right: 1.5px solid var(--primary-color);
  border-bottom: 1.5px solid var(--primary-color);
  opacity: 0.85;
  cursor: se-resize;
  pointer-events: auto;
}
</style>
