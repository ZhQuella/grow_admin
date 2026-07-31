<template>
  <div class="box-border flex w-full flex-col gap-3 px-3 py-3">
    <GrowForm
      class="w-full"
      label-position="top"
      size="small"
      :show-message="false"
    >
      <GrowFormItem
        label="报表类型"
        class="report-type-form-item mb-0 w-full"
      >
        <div class="grid w-full grid-cols-6 gap-1.5">
          <GrowTooltip
            v-for="option in REPORT_CHART_TYPE_OPTIONS"
            :key="option.value"
            :content="option.label"
            placement="top"
          >
            <div
              class="report-type-cell box-border w-full rounded-md"
              :class="{
                'is-selected': item.chartType === option.value,
                'is-hovered': hoveredType === option.value && item.chartType !== option.value,
              }"
              :style="resolveCellStyle(option)"
            >
              <GrowButton
                text
                class="!box-border !aspect-square !h-auto !w-full !min-w-0 !rounded-md !bg-transparent !p-0"
                @click="onSelectType(option.value)"
                @mouseenter="hoveredType = option.value"
                @mouseleave="hoveredType = null"
              >
                <GrowIconify
                  class="report-type-cell__icon !inline-flex items-center justify-center leading-none [&_svg]:block"
                  :icon="option.icon"
                  :size="18"
                  :color="resolveIconColor(option)"
                  :hover-color="resolveIconColor(option)"
                />
              </GrowButton>
            </div>
          </GrowTooltip>
        </div>
      </GrowFormItem>
    </GrowForm>

    <div class="border-t border-solid border-border pt-3">
      <div class="mb-2 text-xs font-medium text-text">
        {{ currentTypeLabel }} · 图表配置
      </div>
      <ChartOptionFields
        :chart-type="item.chartType"
        :model-value="resolvedChartConfig"
        @update:model-value="onChartConfigChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  createDefaultChartConfig,
  type ReportChartConfig,
} from '../../GrowReportRenderer/chartConfig'
import {
  REPORT_CHART_TYPE_OPTIONS,
  getReportChartTypeOption,
  toChartTypeSoftBg,
  type ReportChartType,
  type ReportChartTypeOption,
  type ReportLayoutItem,
} from '../../GrowReportRenderer/types'
import { confirmClearChartConfig } from '../static/confirmClearChartConfig'
import ChartOptionFields from './ChartOptionFields.vue'

defineOptions({
  name: 'ReportConfigPanel',
})

const props = defineProps<{
  item: ReportLayoutItem
}>()

const emit = defineEmits<{
  change: [patch: Partial<Pick<ReportLayoutItem, 'chartType' | 'chartConfig'>>]
}>()

const hoveredType = ref<ReportChartType | null>(null)

const currentTypeLabel = computed(
  () => getReportChartTypeOption(props.item.chartType).label,
)

const resolvedChartConfig = computed<ReportChartConfig>(
  () => props.item.chartConfig ?? createDefaultChartConfig(props.item.chartType),
)

const resolveIconColor = (option: ReportChartTypeOption) => {
  if (props.item.chartType === option.value || hoveredType.value === option.value) {
    return option.color
  }
  return 'var(--text-color-secondary)'
}

const resolveCellStyle = (option: ReportChartTypeOption) => {
  if (props.item.chartType === option.value) {
    return { backgroundColor: toChartTypeSoftBg(option.color, 0.16) }
  }
  if (hoveredType.value === option.value) {
    return { backgroundColor: 'var(--header-action-hover-bg-color)' }
  }
  return { backgroundColor: 'transparent' }
}

const onChartConfigChange = (chartConfig: ReportChartConfig) => {
  emit('change', { chartConfig })
}

const onSelectType = async (chartType: ReportChartType) => {
  if (chartType === props.item.chartType) return

  const fromLabel = getReportChartTypeOption(props.item.chartType).label
  const toLabel = getReportChartTypeOption(chartType).label
  const ok = await confirmClearChartConfig({ fromLabel, toLabel })
  if (!ok) return

  emit('change', {
    chartType,
    chartConfig: createDefaultChartConfig(chartType),
  })
}
</script>

<style scoped>
/* 保证表单项内容区撑满，类型网格可随面板宽度自适应 */
.report-type-form-item :deep(.el-form-item__content),
.report-type-form-item :deep(.n-form-item-blank),
.report-type-form-item :deep(.ant-form-item-control),
.report-type-form-item :deep(.ant-form-item-control-input),
.report-type-form-item :deep(.ant-form-item-control-input-content) {
  width: 100%;
  max-width: 100%;
  display: block;
}

.report-type-cell {
  transform: scale(1);
  transition:
    background-color 0.22s ease,
    transform 0.22s ease;
}

.report-type-cell.is-hovered {
  transform: scale(1.04);
}

.report-type-cell.is-selected {
  transform: scale(1.06);
}

.report-type-cell__icon {
  transition: transform 0.22s ease;
}

.report-type-cell.is-hovered .report-type-cell__icon,
.report-type-cell.is-selected .report-type-cell__icon {
  transform: scale(1.08);
}
</style>
