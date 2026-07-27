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
              <span class="text-xs font-medium text-text">
                系列 {{ index + 1 }}
                <span v-if="element.name" class="ml-1 font-normal text-text-secondary">
                  · {{ element.name }}
                </span>
              </span>
            </div>
            <GrowButton
              text
              size="small"
              type="danger"
              class="!px-1"
              title="删除系列"
              @click="onRemove(element._dragKey)"
            >
              <GrowIconify icon="carbon:trash-can" :size="14" />
            </GrowButton>
          </div>

          <ChartSeriesItemFields
            :model="element"
            @patch="(p) => onPatch(element._dragKey, p)"
            @patch-nested="(path, value) => onPatchNested(element._dragKey, path, value)"
          />
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
import { cloneDeep } from '@grow-admin-rock/utils'
import type { ReportChartConfig } from '../../GrowReportRenderer/chartConfig'
import ChartSeriesItemFields from './ChartSeriesItemFields.vue'

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

const createDragKey = () =>
  `series-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const dragList = ref<DragSeriesItem[]>([])

const toPlainList = (list: DragSeriesItem[]): SeriesItem[] =>
  list.map(({ _dragKey, ...item }) => item)

const syncFromProps = (value?: SeriesItem[] | null) => {
  const incoming = Array.isArray(value) ? value : []
  const prevKeys = dragList.value.map((item) => item._dragKey)
  dragList.value = incoming.map((item, index) => ({
    ...cloneDeep(item),
    _dragKey: prevKeys[index] ?? createDragKey(),
  }))
}

watch(
  () => props.modelValue,
  (value) => {
    const current = toPlainList(dragList.value)
    const incoming = Array.isArray(value) ? value : []
    if (JSON.stringify(current) === JSON.stringify(incoming)) return
    syncFromProps(value)
  },
  { immediate: true, deep: true },
)

const emitList = () => {
  emit('update:modelValue', toPlainList(dragList.value))
}

const onPatch = (dragKey: string, patch: Partial<SeriesItem>) => {
  dragList.value = dragList.value.map((item) => {
    if (item._dragKey !== dragKey) return item
    const next = { ...item, ...patch }
    Object.keys(patch).forEach((key) => {
      if ((patch as any)[key] === undefined) delete (next as any)[key]
    })
    return next
  })
  emitList()
}

const setByPath = (target: Record<string, any>, path: string, value: unknown) => {
  const keys = path.split('.')
  let cursor = target
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!cursor[key] || typeof cursor[key] !== 'object') cursor[key] = {}
    cursor = cursor[key]
  }
  const last = keys[keys.length - 1]
  if (value === undefined) delete cursor[last]
  else cursor[last] = value
}

const onPatchNested = (dragKey: string, path: string, value: unknown) => {
  dragList.value = dragList.value.map((item) => {
    if (item._dragKey !== dragKey) return item
    const next = cloneDeep(item)
    setByPath(next, path, value)
    return next
  })
  emitList()
}

const onRemove = (dragKey: string) => {
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
      xAxisIndex: 0,
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
