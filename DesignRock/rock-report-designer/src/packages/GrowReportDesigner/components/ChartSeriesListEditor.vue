<template>
  <div class="flex w-full flex-col gap-2">
    <draggable
      v-model="dragList"
      item-key="_dragKey"
      handle=".series-drag-handle"
      :animation="180"
      class="flex w-full flex-col gap-2"
      @end="emitList"
    >
      <template #item="{ element, index }">
        <div
          class="box-border rounded-md border border-solid border-border bg-layout/40 px-2.5 py-2"
        >
          <div class="mb-2 flex items-center justify-between gap-2">
            <div class="flex min-w-0 items-center gap-1">
              <span class="series-drag-handle" title="拖拽排序">
                <GrowIconify icon="carbon:draggable" :size="14" />
              </span>
              <span class="text-xs font-medium text-text">系列 {{ index + 1 }}</span>
            </div>
            <GrowButton
              text
              size="small"
              type="danger"
              class="!px-1"
              :disabled="dragList.length <= 1"
              title="删除系列"
              @click="onRemove(element._dragKey)"
            >
              <GrowIconify icon="carbon:trash-can" :size="14" />
            </GrowButton>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <span class="w-14 shrink-0 text-xs text-text-secondary">名称</span>
              <GrowInput
                class="min-w-0 flex-1"
                size="small"
                clearable
                :model-value="element.name"
                placeholder="系列名称"
                @update:model-value="(v) => onPatch(element._dragKey, { name: String(v ?? '') })"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="w-14 shrink-0 text-xs text-text-secondary">类型</span>
              <GrowSelect
                class="min-w-0 flex-1"
                size="small"
                :options="CARTESIAN_SERIES_TYPE_OPTIONS"
                :model-value="element.type || 'line'"
                @update:model-value="(v) => onPatch(element._dragKey, { type: v as CartesianSeriesType })"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="w-14 shrink-0 text-xs text-text-secondary">坐标轴</span>
              <GrowSelect
                class="min-w-0 flex-1"
                size="small"
                :options="yAxisIndexOptions"
                :model-value="element.yAxisIndex ?? 0"
                @update:model-value="(v) => onPatch(element._dragKey, { yAxisIndex: Number(v) || 0 })"
              />
            </div>

            <template v-if="element.type === 'line'">
              <div class="flex items-center gap-2">
                <span class="w-14 shrink-0 text-xs text-text-secondary">平滑</span>
                <GrowSwitch
                  size="small"
                  :model-value="!!element.smooth"
                  @update:model-value="(v) => onPatch(element._dragKey, { smooth: !!v })"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="w-14 shrink-0 text-xs text-text-secondary">拐点</span>
                <GrowSwitch
                  size="small"
                  :model-value="element.showSymbol !== false"
                  @update:model-value="(v) => onPatch(element._dragKey, { showSymbol: !!v })"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="w-14 shrink-0 text-xs text-text-secondary">面积</span>
                <GrowSwitch
                  size="small"
                  :model-value="!!element.areaStyle"
                  @update:model-value="(v) => onPatch(element._dragKey, { areaStyle: !!v })"
                />
              </div>
            </template>

            <template v-else-if="element.type === 'bar'">
              <div class="flex items-center gap-2">
                <span class="w-14 shrink-0 text-xs text-text-secondary">柱宽</span>
                <GrowInput
                  class="min-w-0 flex-1"
                  size="small"
                  clearable
                  :model-value="stringify(element.barWidth)"
                  placeholder="如 20 或 40%"
                  @update:model-value="(v) => onPatch(element._dragKey, { barWidth: v as string })"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="w-14 shrink-0 text-xs text-text-secondary">堆叠</span>
                <GrowInput
                  class="min-w-0 flex-1"
                  size="small"
                  clearable
                  :model-value="element.stack"
                  placeholder="同名堆叠"
                  @update:model-value="(v) => onPatch(element._dragKey, { stack: String(v ?? '') })"
                />
              </div>
            </template>

            <template v-else-if="element.type === 'candlestick'">
              <div class="flex items-center gap-2">
                <span class="w-14 shrink-0 text-xs text-text-secondary">最大柱宽</span>
                <GrowInputNumber
                  class="min-w-0 flex-1"
                  size="small"
                  :controls="false"
                  :model-value="element.barMaxWidth ?? 20"
                  @update:model-value="(v) => onPatch(element._dragKey, { barMaxWidth: Number(v) || 20 })"
                />
              </div>
            </template>

            <template v-else>
              <div class="flex items-center gap-2">
                <span class="w-14 shrink-0 text-xs text-text-secondary">标记</span>
                <GrowSelect
                  class="min-w-0 flex-1"
                  size="small"
                  :options="symbolOptions"
                  :model-value="element.symbol || 'circle'"
                  @update:model-value="(v) => onPatch(element._dragKey, { symbol: String(v) })"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="w-14 shrink-0 text-xs text-text-secondary">大小</span>
                <GrowInputNumber
                  class="min-w-0 flex-1"
                  size="small"
                  :controls="false"
                  :model-value="element.symbolSize ?? 10"
                  @update:model-value="(v) => onPatch(element._dragKey, { symbolSize: Number(v) || 10 })"
                />
              </div>
            </template>
          </div>
        </div>
      </template>
    </draggable>

    <GrowButton size="small" class="w-full" @click="onAdd">
      <GrowIconify icon="carbon:add" :size="14" class="mr-1 align-[-2px]" />
      添加系列
    </GrowButton>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import {
  CARTESIAN_SERIES_TYPE_OPTIONS,
  type CartesianSeriesType,
} from '../../GrowReportRenderer/chartTypes'
import type { ReportChartConfig } from '../../GrowReportRenderer/chartConfig'

defineOptions({
  name: 'ChartSeriesListEditor',
})

type SeriesItem = NonNullable<ReportChartConfig['seriesList']>[number]
type DragSeriesItem = SeriesItem & { _dragKey: string }

const props = withDefaults(
  defineProps<{
    modelValue?: SeriesItem[] | null
  }>(),
  {
    modelValue: () => [],
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: SeriesItem[]]
}>()

const yAxisIndexOptions = [
  { label: '左轴', value: 0 },
  { label: '右轴', value: 1 },
]

const symbolOptions = [
  { label: '圆形', value: 'circle' },
  { label: '矩形', value: 'rect' },
  { label: '圆角矩形', value: 'roundRect' },
  { label: '三角形', value: 'triangle' },
  { label: '菱形', value: 'diamond' },
  { label: '图钉', value: 'pin' },
  { label: '箭头', value: 'arrow' },
]

const createDragKey = () =>
  `series-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const createDefaultItem = (): DragSeriesItem => ({
  _dragKey: createDragKey(),
  name: '系列1',
  type: 'line',
  yAxisIndex: 0,
})

const dragList = ref<DragSeriesItem[]>([createDefaultItem()])

const toPlainList = (list: DragSeriesItem[]): SeriesItem[] =>
  list.map(({ _dragKey, ...item }) => item)

const syncFromProps = (value?: SeriesItem[] | null) => {
  const incoming = value?.length
    ? value
    : [{ name: '系列1', type: 'line' as const, yAxisIndex: 0 }]
  const prevKeys = dragList.value.map((item) => item._dragKey)
  dragList.value = incoming.map((item, index) => ({
    ...item,
    _dragKey: prevKeys[index] ?? createDragKey(),
  }))
}

watch(
  () => props.modelValue,
  (value) => {
    const current = toPlainList(dragList.value)
    const incoming = value?.length
      ? value
      : [{ name: '系列1', type: 'line' as const, yAxisIndex: 0 }]
    if (JSON.stringify(current) === JSON.stringify(incoming)) return
    syncFromProps(value)
  },
  { immediate: true, deep: true },
)

const stringify = (value: unknown) => {
  if (value == null) return ''
  return String(value)
}

const emitList = () => {
  emit('update:modelValue', toPlainList(dragList.value))
}

const onPatch = (dragKey: string, patch: Partial<SeriesItem>) => {
  dragList.value = dragList.value.map((item) =>
    item._dragKey === dragKey ? { ...item, ...patch } : item,
  )
  emitList()
}

const onRemove = (dragKey: string) => {
  if (dragList.value.length <= 1) return
  dragList.value = dragList.value.filter((item) => item._dragKey !== dragKey)
  emitList()
}

const onAdd = () => {
  const idx = dragList.value.length + 1
  dragList.value = [
    ...dragList.value,
    {
      _dragKey: createDragKey(),
      name: `系列${idx}`,
      type: 'line',
      yAxisIndex: 0,
      smooth: false,
      showSymbol: true,
    },
  ]
  emitList()
}
</script>

<style scoped lang="scss">
.series-drag-handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: var(--text-color-secondary, #909399);
  cursor: grab;
  line-height: 0;
  flex-shrink: 0;

  &:active {
    cursor: grabbing;
  }
}
</style>
