<template>
  <div class="report-block-chart box-border h-full min-h-0 w-full">
    <div ref="chartRef" class="box-border h-full min-h-0 w-full" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch, type Ref } from 'vue'
import { useEcharts } from '@grow-admin-rock/hooks'
import { GROW_RUNTIME_STATE } from '@grow-admin-rock/designer'
import {
  buildEChartsOption,
  createDefaultChartConfig,
  type ReportChartConfig,
  type ReportChartType,
} from '../chartConfig'
import {
  resolveBlockDataBinding,
  resolveDatasetBinding,
  type ReportBlockDataBinding,
  type ResolvedChartDataPayload,
} from '../dataBinding'

defineOptions({
  name: 'ReportBlockChart',
})

const props = defineProps<{
  chartType: ReportChartType
  chartConfig?: ReportChartConfig | null
  dataBinding?: ReportBlockDataBinding | null
}>()

const chartRef = ref<HTMLDivElement | null>(null)
const { setOptions } = useEcharts(chartRef as Ref<HTMLDivElement>)

const runtimeState = inject<Record<string, unknown>>(GROW_RUNTIME_STATE, {})

const resolvedConfig = computed(
  () => props.chartConfig ?? createDefaultChartConfig(props.chartType),
)

const datasetPayload = ref<ResolvedChartDataPayload | null>(null)

const resolvedChartData = computed(() => {
  if ((props.dataBinding?.sourceMode || 'state') === 'dataset') {
    return datasetPayload.value || {}
  }
  return resolveBlockDataBinding(props.dataBinding, runtimeState || {})
})

const renderChart = async () => {
  const option = buildEChartsOption(
    props.chartType,
    resolvedConfig.value,
    resolvedChartData.value,
  )
  await setOptions(option)
}

const refreshDataset = async () => {
  if ((props.dataBinding?.sourceMode || 'state') !== 'dataset') {
    datasetPayload.value = null
    return
  }
  try {
    datasetPayload.value = await resolveDatasetBinding(props.dataBinding)
  } catch {
    datasetPayload.value = { xAxisData: [], seriesData: [] }
  }
}

watch(
  () => props.dataBinding,
  () => {
    void refreshDataset().then(() => renderChart())
  },
  { deep: true, immediate: true },
)

watch(
  [() => props.chartType, () => props.chartConfig, runtimeState, datasetPayload],
  () => {
    void renderChart()
  },
  { deep: true },
)
</script>
