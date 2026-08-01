<template>
  <div class="box-border flex w-full flex-col gap-3 px-3 py-3">
    <template v-if="isCartesian">
      <div class="text-xs font-medium text-text">数据来源</div>
      <GrowRadioButtonGroup
        :model-value="sourceMode"
        size="small"
        :options="sourceModeOptions"
        @update:model-value="onSourceModeChange"
      />

      <template v-if="sourceMode === 'dataset'">
        <p class="m-0 text-xs text-text-secondary">
          绑定数据准备中的 Dataset（本版支持柱状 / 折线等笛卡尔图）。
        </p>
        <div class="text-xs font-medium text-text">数据集</div>
        <GrowSelect
          :model-value="local.dataset?.datasetId"
          :options="datasetOptions"
          size="small"
          class="w-full"
          placeholder="选择数据集"
          clearable
          @update:model-value="onDatasetIdChange"
        />
        <div class="text-xs font-medium text-text">类目轴（维度）</div>
        <GrowSelect
          :model-value="local.dataset?.categoryFieldId"
          :options="dimensionOptions"
          size="small"
          class="w-full"
          placeholder="选择维度"
          clearable
          :disabled="!local.dataset?.datasetId"
          @update:model-value="(v) => onDatasetPatch({ categoryFieldId: v ? String(v) : undefined })"
        />
        <div class="mt-1 text-xs font-medium text-text">系列数据（度量）</div>
        <div
          v-for="(series, index) in seriesList"
          :key="`series-dataset-${index}`"
          class="rounded-md border border-solid border-border bg-layout/40 px-2.5 py-2"
        >
          <div class="mb-2 text-xs text-text">
            系列 {{ index + 1 }}
            <span v-if="series.name" class="text-text-secondary">· {{ series.name }}</span>
          </div>
          <GrowSelect
            :model-value="local.dataset?.seriesFieldIds?.[index]"
            :options="measureOptions"
            size="small"
            class="w-full"
            placeholder="选择度量"
            clearable
            :disabled="!local.dataset?.datasetId"
            @update:model-value="(v) => onSeriesField(index, v ? String(v) : undefined)"
          />
        </div>
        <p v-if="!seriesList.length" class="m-0 text-xs text-text-secondary">
          请先在「报表配置」中添加系列
        </p>
        <p v-if="!datasetOptions.length" class="m-0 text-xs text-text-secondary">
          暂无数据集，请先到「数据准备」保存一份
        </p>
      </template>

      <template v-else>
        <p class="m-0 text-xs text-text-secondary">
          绑定页面 state（数据源 / 数据请求 / 计算属性）。可直接填写，或点 f 用代码绑定。
        </p>
        <div class="text-xs font-medium text-text">坐标轴</div>
        <BindRefEditor
          label="X 轴 data"
          :model-value="local.xAxisData"
          :variable-options="variableOptions"
          @update:model-value="(v) => onPatch({ xAxisData: v })"
        />
        <BindRefEditor
          v-if="needYCategory"
          label="Y 轴 data"
          :model-value="local.yAxisData"
          :variable-options="variableOptions"
          @update:model-value="(v) => onPatch({ yAxisData: v })"
        />

        <div class="mt-1 text-xs font-medium text-text">系列数据（按下标）</div>
        <div
          v-for="(series, index) in seriesList"
          :key="`series-bind-${index}`"
          class="rounded-md border border-solid border-border bg-layout/40 px-2.5 py-2"
        >
          <div class="mb-2 text-xs text-text">
            系列 {{ index + 1 }}
            <span v-if="series.name" class="text-text-secondary">· {{ series.name }}</span>
          </div>
          <BindRefEditor
            label="data"
            :model-value="local.seriesData?.[index]"
            :variable-options="variableOptions"
            @update:model-value="(v) => onSeriesBind(index, v)"
          />
        </div>
        <p v-if="!seriesList.length" class="m-0 text-xs text-text-secondary">
          请先在「报表配置」中添加系列
        </p>
      </template>
    </template>

    <template v-else-if="chartType === 'radar'">
      <p class="m-0 text-xs text-text-secondary">
        绑定页面 state（数据源 / 数据请求 / 计算属性）。可直接填写，或点 f 用代码绑定。
      </p>
      <BindRefEditor
        label="指示器"
        :model-value="local.radarIndicator"
        :variable-options="variableOptions"
        @update:model-value="(v) => onPatch({ radarIndicator: v })"
      />
      <BindRefEditor
        label="系列 data"
        describe="可为 data 数组，或按系列下标绑定 value"
        :model-value="local.chartData"
        :variable-options="variableOptions"
        @update:model-value="(v) => onPatch({ chartData: v })"
      />
      <div
        v-for="(series, index) in radarSeriesList"
        :key="`radar-series-bind-${index}`"
        class="rounded-md border border-solid border-border bg-layout/40 px-2.5 py-2"
      >
        <div class="mb-2 text-xs text-text">
          雷达系列 {{ index + 1 }}
          <span v-if="series.name" class="text-text-secondary">· {{ series.name }}</span>
        </div>
        <BindRefEditor
          label="value"
          :model-value="local.seriesData?.[index]"
          :variable-options="variableOptions"
          @update:model-value="(v) => onSeriesBind(index, v)"
        />
      </div>
    </template>

    <template v-else>
      <p class="m-0 text-xs text-text-secondary">
        绑定页面 state（数据源 / 数据请求 / 计算属性）。可直接填写，或点 f 用代码绑定。
      </p>
      <BindRefEditor
        label="图表 data"
        :describe="chartDataHint"
        :model-value="local.chartData"
        :variable-options="variableOptions"
        @update:model-value="(v) => onPatch({ chartData: v })"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  ensureDemoDataset,
  getDatasetFromStorage,
  loadDatasetsFromStorage,
  type DataPrepDataset,
} from '@grow-admin-rock/data-prep'
import type {
  ReportBlockDataBinding,
  ReportDataBindRef,
  ReportDataBindingSourceMode,
  ReportDatasetBinding,
} from '../../GrowReportRenderer/dataBinding'
import type { ReportLayoutItem } from '../../GrowReportRenderer/types'
import BindRefEditor from './BindRefEditor.vue'

defineOptions({
  name: 'BlockDataBindingPanel',
})

const props = withDefaults(
  defineProps<{
    item: ReportLayoutItem
    variableOptions?: Array<{ label: string; value: string }>
  }>(),
  {
    variableOptions: () => [],
  },
)

const emit = defineEmits<{
  change: [patch: Partial<Pick<ReportLayoutItem, 'dataBinding'>>]
}>()

const datasets = ref<DataPrepDataset[]>([])

const sourceModeOptions = [
  { label: '页面状态', value: 'state' },
  { label: '数据集', value: 'dataset' },
]

const chartType = computed(() => props.item.chartType)
const isCartesian = computed(() => chartType.value === 'cartesian')
const needYCategory = computed(
  () => chartType.value === 'heatmap' || chartType.value === 'matrix',
)

const local = computed<ReportBlockDataBinding>(() => props.item.dataBinding || {})
const sourceMode = computed<ReportDataBindingSourceMode>(
  () => local.value.sourceMode || 'state',
)

const seriesList = computed(() => props.item.chartConfig?.seriesList || [])
const radarSeriesList = computed(() => props.item.chartConfig?.radarSeriesList || [])

const datasetOptions = computed(() =>
  datasets.value.map((item) => ({ label: item.name, value: item.id })),
)

const activeDataset = computed(() => {
  const id = local.value.dataset?.datasetId
  if (!id) return null
  return datasets.value.find((item) => item.id === id) || getDatasetFromStorage(id) || null
})

const dimensionOptions = computed(() =>
  (activeDataset.value?.dimensions || []).map((d) => ({ label: d.name, value: d.id })),
)

const measureOptions = computed(() =>
  (activeDataset.value?.measures || []).map((m) => ({
    label: `${m.name}(${m.agg})`,
    value: m.id,
  })),
)

const chartDataHint = computed(() => {
  if (chartType.value === 'graph' || chartType.value === 'chord' || chartType.value === 'sankey') {
    return '可为数组，或 { data, links }'
  }
  return '函数体求值结果写入系列 data'
})

onMounted(() => {
  ensureDemoDataset()
  datasets.value = loadDatasetsFromStorage()
})

const onPatch = (patch: Partial<ReportBlockDataBinding>) => {
  emit('change', {
    dataBinding: {
      ...local.value,
      ...patch,
    },
  })
}

const onSourceModeChange = (value: string | number | boolean | undefined) => {
  const mode = String(value || 'state') as ReportDataBindingSourceMode
  onPatch({ sourceMode: mode })
}

const onDatasetIdChange = (value: string | number | null | undefined) => {
  const datasetId = value ? String(value) : ''
  const ds = datasetId ? getDatasetFromStorage(datasetId) : null
  const next: ReportDatasetBinding = {
    datasetId,
    categoryFieldId: ds?.dimensions[0]?.id,
    seriesFieldIds: seriesList.value.map((_, index) => ds?.measures[index]?.id || ''),
  }
  onPatch({ sourceMode: 'dataset', dataset: next })
}

const onDatasetPatch = (patch: Partial<ReportDatasetBinding>) => {
  onPatch({
    sourceMode: 'dataset',
    dataset: {
      datasetId: local.value.dataset?.datasetId || '',
      ...local.value.dataset,
      ...patch,
    },
  })
}

const onSeriesField = (index: number, fieldId?: string) => {
  const next = [...(local.value.dataset?.seriesFieldIds || [])]
  while (next.length <= index) next.push('')
  next[index] = fieldId || ''
  onDatasetPatch({ seriesFieldIds: next })
}

const onSeriesBind = (index: number, value?: ReportDataBindRef) => {
  const next = [...(local.value.seriesData || [])]
  while (next.length <= index) next.push({})
  next[index] = value || {}
  onPatch({ seriesData: next })
}
</script>
