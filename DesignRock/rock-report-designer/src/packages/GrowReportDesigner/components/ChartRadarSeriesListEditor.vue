<template>
  <div class="flex w-full flex-col gap-2">
    <draggable
      v-model="dragList"
      item-key="_dragKey"
      handle=".radar-series-drag-handle"
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
              <span class="radar-series-drag-handle" title="拖拽排序">
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
              <span class="w-16 shrink-0 text-xs text-text-secondary">名称</span>
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
              <span class="w-16 shrink-0 text-xs text-text-secondary">面积填充</span>
              <GrowSelect
                class="min-w-0 flex-1"
                size="small"
                :options="areaFillOptions"
                :model-value="element.areaFill || 'none'"
                @update:model-value="(v) => onPatch(element._dragKey, { areaFill: v as AreaFill })"
              />
            </div>

            <div
              v-if="element.areaFill === 'solid'"
              class="flex items-center gap-2"
            >
              <span class="w-16 shrink-0 text-xs text-text-secondary">填充色</span>
              <GrowColorPicker
                class="min-w-0 flex-1"
                size="small"
                show-alpha
                :model-value="element.areaColor || null"
                @update:model-value="
                  (v) => onPatch(element._dragKey, { areaColor: String(v ?? '') })
                "
              />
            </div>

            <template v-else-if="element.areaFill === 'radial'">
              <div class="flex items-center gap-2">
                <span class="w-16 shrink-0 text-xs text-text-secondary">渐变起色</span>
                <GrowColorPicker
                  class="min-w-0 flex-1"
                  size="small"
                  show-alpha
                  :model-value="element.gradientFrom || null"
                  @update:model-value="
                    (v) => onPatch(element._dragKey, { gradientFrom: String(v ?? '') })
                  "
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="w-16 shrink-0 text-xs text-text-secondary">渐变止色</span>
                <GrowColorPicker
                  class="min-w-0 flex-1"
                  size="small"
                  show-alpha
                  :model-value="element.gradientTo || null"
                  @update:model-value="
                    (v) => onPatch(element._dragKey, { gradientTo: String(v ?? '') })
                  "
                />
              </div>
            </template>

            <div class="flex items-center gap-2">
              <span class="w-16 shrink-0 text-xs text-text-secondary">线型</span>
              <GrowSelect
                class="min-w-0 flex-1"
                size="small"
                :options="lineTypeOptions"
                :model-value="element.lineType || 'solid'"
                @update:model-value="(v) => onPatch(element._dragKey, { lineType: v as LineType })"
              />
            </div>

            <div class="flex items-center gap-2">
              <span class="w-16 shrink-0 text-xs text-text-secondary">标记</span>
              <GrowSelect
                class="min-w-0 flex-1"
                size="small"
                :options="symbolOptions"
                :model-value="element.symbol || 'circle'"
                @update:model-value="(v) => onPatch(element._dragKey, { symbol: String(v) })"
              />
            </div>

            <div class="flex items-center gap-2">
              <span class="w-16 shrink-0 text-xs text-text-secondary">标记大小</span>
              <GrowInputNumber
                class="min-w-0 flex-1"
                size="small"
                :controls="false"
                :model-value="element.symbolSize ?? 6"
                @update:model-value="(v) => onPatch(element._dragKey, { symbolSize: Number(v) || 6 })"
              />
            </div>

            <div class="flex items-center gap-2">
              <span class="w-16 shrink-0 text-xs text-text-secondary">数值标签</span>
              <GrowSwitch
                size="small"
                :model-value="!!element.showLabel"
                @update:model-value="(v) => onPatch(element._dragKey, { showLabel: !!v })"
              />
            </div>
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
import type { ReportChartConfig } from '../../GrowReportRenderer/chartConfig'

defineOptions({
  name: 'ChartRadarSeriesListEditor',
})

type RadarSeriesItem = NonNullable<ReportChartConfig['radarSeriesList']>[number]
type AreaFill = NonNullable<RadarSeriesItem['areaFill']>
type LineType = NonNullable<RadarSeriesItem['lineType']>
type DragRadarSeriesItem = RadarSeriesItem & { _dragKey: string }

const props = withDefaults(
  defineProps<{
    modelValue?: RadarSeriesItem[] | null
  }>(),
  {
    modelValue: () => [],
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: RadarSeriesItem[]]
}>()

const areaFillOptions = [
  { label: '无', value: 'none' },
  { label: '纯色', value: 'solid' },
  { label: '径向渐变', value: 'radial' },
]

const lineTypeOptions = [
  { label: '实线', value: 'solid' },
  { label: '虚线', value: 'dashed' },
]

const symbolOptions = [
  { label: '圆形', value: 'circle' },
  { label: '矩形', value: 'rect' },
  { label: '圆角矩形', value: 'roundRect' },
  { label: '三角形', value: 'triangle' },
  { label: '菱形', value: 'diamond' },
]

const createDragKey = () =>
  `radar-series-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const createDefaultItem = (): DragRadarSeriesItem => ({
  _dragKey: createDragKey(),
  name: '系列1',
  areaFill: 'solid',
  areaColor: 'rgba(103, 249, 216, 0.45)',
  gradientFrom: 'rgba(255, 145, 124, 0.1)',
  gradientTo: 'rgba(255, 145, 124, 0.9)',
  lineType: 'solid',
  symbol: 'circle',
  symbolSize: 6,
  showLabel: false,
})

const dragList = ref<DragRadarSeriesItem[]>([createDefaultItem()])

const toPlainList = (list: DragRadarSeriesItem[]): RadarSeriesItem[] =>
  list.map(({ _dragKey, ...item }) => item)

const syncFromProps = (value?: RadarSeriesItem[] | null) => {
  const incoming = value?.length ? value : [createDefaultItem()]
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
      : [
          {
            name: '系列1',
            areaFill: 'solid' as const,
            areaColor: 'rgba(103, 249, 216, 0.45)',
            lineType: 'solid' as const,
            symbol: 'circle',
            symbolSize: 6,
            showLabel: false,
          },
        ]
    if (JSON.stringify(current) === JSON.stringify(incoming)) return
    syncFromProps(value)
  },
  { immediate: true, deep: true },
)

const emitList = () => {
  emit('update:modelValue', toPlainList(dragList.value))
}

const onPatch = (dragKey: string, patch: Partial<RadarSeriesItem>) => {
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
      areaFill: 'none',
      areaColor: 'rgba(86, 163, 241, 0.45)',
      gradientFrom: 'rgba(86, 163, 241, 0.1)',
      gradientTo: 'rgba(86, 163, 241, 0.85)',
      lineType: 'solid',
      symbol: 'circle',
      symbolSize: 6,
      showLabel: false,
    },
  ]
  emitList()
}
</script>

<style scoped lang="scss">
.radar-series-drag-handle {
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
