<template>
  <div class="report-block-chart box-border h-full min-h-0 w-full">
    <div ref="chartRef" class="box-border h-full min-h-0 w-full" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Ref } from 'vue'
import { useEcharts } from '@grow-admin-rock/hooks'
import {
  buildEChartsOption,
  createDefaultChartConfig,
  type ReportChartConfig,
  type ReportChartType,
} from '../chartConfig'

defineOptions({
  name: 'ReportBlockChart',
})

const props = defineProps<{
  chartType: ReportChartType
  chartConfig?: ReportChartConfig | null
}>()

const chartRef = ref<HTMLDivElement | null>(null)
const { setOptions } = useEcharts(chartRef as Ref<HTMLDivElement>)

const resolvedConfig = computed(
  () => props.chartConfig ?? createDefaultChartConfig(props.chartType),
)

const renderChart = async () => {
  const option = buildEChartsOption(props.chartType, resolvedConfig.value)
  // setOptions 内部异步执行 setOption；勿紧跟 resize，否则会触发
  //「resize should not be called during main process」
  await setOptions(option)
}

watch(
  () => ({
    chartType: props.chartType,
    chartConfig: props.chartConfig,
  }),
  () => {
    void renderChart()
  },
  { deep: true, immediate: true },
)
</script>
