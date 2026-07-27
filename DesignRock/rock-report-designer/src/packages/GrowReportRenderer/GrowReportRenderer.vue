<template>
  <div class="box-border h-full min-h-0 w-full overflow-auto">
    <div
      v-if="layout.length"
      class="relative w-full"
      :style="{ minHeight: boardHeight }"
    >
      <div
        v-for="item in layout"
        :key="item.i"
        class="absolute box-border p-[5px]"
        :style="toPreviewItemStyle(item, colNum, rowHeight)"
      >
        <GrowCard class="report-block-card flex h-full flex-col overflow-hidden">
          <template v-if="item.showTitle" #header>
            <span>{{ item.title }}</span>
          </template>
          <ReportBlockChart
            class="min-h-0 flex-1"
            :chart-type="item.chartType"
            :chart-config="item.chartConfig"
          />
        </GrowCard>
      </div>
    </div>
    <div v-else class="flex-center h-full min-h-60 w-full">
      <GrowEmpty>
        <slot name="empty">暂无内容</slot>
      </GrowEmpty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ReportBlockChart from './components/ReportBlockChart.vue'
import {
  REPORT_GRID_COL_NUM,
  REPORT_GRID_ROW_HEIGHT,
  getPreviewBoardHeight,
  toPreviewItemStyle,
  type ReportSchema,
} from './types'

defineOptions({
  name: 'GrowReportRenderer',
})

const props = withDefaults(
  defineProps<{
    /** 设计器导出的报表 schema（layout + pageConfig） */
    schema?: ReportSchema | null
  }>(),
  {
    schema: null,
  },
)

const resolvedSchema = computed<ReportSchema>(() => props.schema || {})

const layout = computed(() => resolvedSchema.value.layout || [])

const colNum = computed(
  () => resolvedSchema.value.pageConfig?.colNum ?? REPORT_GRID_COL_NUM,
)

const rowHeight = computed(
  () => resolvedSchema.value.pageConfig?.rowHeight ?? REPORT_GRID_ROW_HEIGHT,
)

const boardHeight = computed(() =>
  getPreviewBoardHeight(layout.value, rowHeight.value),
)
</script>

<style scoped>
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
