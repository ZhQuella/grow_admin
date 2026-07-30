<template>
  <div class="box-border flex w-full flex-col gap-3 px-3 py-3">
    <p class="m-0 text-xs text-text-secondary">
      绑定页面 state（数据源 / 数据请求 / 计算属性）。支持「直接绑定」或「字段映射」。
    </p>

    <template v-if="isCartesian">
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

    <template v-else-if="chartType === 'radar'">
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
import { computed } from 'vue'
import type { ReportBlockDataBinding, ReportDataBindRef } from '../../GrowReportRenderer/dataBinding'
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

const chartType = computed(() => props.item.chartType)
const isCartesian = computed(() => chartType.value === 'cartesian')
const needYCategory = computed(
  () => chartType.value === 'heatmap' || chartType.value === 'matrix',
)

const local = computed<ReportBlockDataBinding>(() => props.item.dataBinding || {})

const seriesList = computed(() => props.item.chartConfig?.seriesList || [])
const radarSeriesList = computed(() => props.item.chartConfig?.radarSeriesList || [])

const chartDataHint = computed(() => {
  if (chartType.value === 'graph' || chartType.value === 'chord' || chartType.value === 'sankey') {
    return '可为数组，或 { data, links }'
  }
  return '函数体求值结果写入系列 data'
})

const onPatch = (patch: Partial<ReportBlockDataBinding>) => {
  emit('change', {
    dataBinding: {
      ...local.value,
      ...patch,
    },
  })
}

const onSeriesBind = (index: number, value?: ReportDataBindRef) => {
  const next = [...(local.value.seriesData || [])]
  while (next.length <= index) next.push({})
  next[index] = value || {}
  onPatch({ seriesData: next })
}
</script>
