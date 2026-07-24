<template>
  <div class="box-border flex flex-col gap-3 px-3 py-3">
    <div class="flex flex-col gap-2">
      <span class="text-xs font-medium text-text">报表类型</span>

      <div class="grid grid-cols-6 justify-items-center gap-y-1.5">
        <GrowTooltip
          v-for="option in REPORT_CHART_TYPE_OPTIONS"
          :key="option.value"
          :content="option.label"
          placement="top"
        >
          <button
            type="button"
            class="box-border flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-none transition-colors duration-150"
            :class="
              item.chartType === option.value || hoveredType === option.value
                ? 'bg-layout'
                : 'bg-transparent'
            "
            @click="onSelectType(option.value)"
            @mouseenter="hoveredType = option.value"
            @mouseleave="hoveredType = null"
          >
            <GrowIconify
              class="!inline-flex items-center justify-center leading-none [&_svg]:block"
              :icon="option.icon"
              :size="18"
              :color="resolveIconColor(option)"
              :hover-color="resolveIconColor(option)"
            />
          </button>
        </GrowTooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  REPORT_CHART_TYPE_OPTIONS,
  type ReportChartType,
  type ReportChartTypeOption,
  type ReportLayoutItem,
} from '../../GrowReportRenderer/types'

defineOptions({
  name: 'ReportConfigPanel',
})

const props = defineProps<{
  item: ReportLayoutItem
}>()

const emit = defineEmits<{
  change: [patch: Partial<Pick<ReportLayoutItem, 'chartType'>>]
}>()

const hoveredType = ref<ReportChartType | null>(null)

const resolveIconColor = (option: ReportChartTypeOption) => {
  if (props.item.chartType === option.value || hoveredType.value === option.value) {
    return option.color
  }
  return 'var(--text-color-secondary)'
}

const onSelectType = (chartType: ReportChartType) => {
  emit('change', { chartType })
}
</script>
