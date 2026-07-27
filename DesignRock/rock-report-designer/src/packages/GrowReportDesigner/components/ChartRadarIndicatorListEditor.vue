<template>
  <div class="flex w-full flex-col gap-2">
    <draggable
      v-model="dragList"
      item-key="_dragKey"
      handle=".radar-indicator-drag-handle"
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
              <span class="radar-indicator-drag-handle" title="拖拽排序">
                <GrowIconify icon="carbon:draggable" :size="14" />
              </span>
              <span class="text-xs font-medium text-text">指示器 {{ index + 1 }}</span>
            </div>
            <GrowButton
              text
              size="small"
              type="danger"
              class="!px-1"
              :disabled="dragList.length <= 3"
              title="删除指示器"
              @click="onRemove(element._dragKey)"
            >
              <GrowIconify icon="carbon:trash-can" :size="14" />
            </GrowButton>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <span class="w-12 shrink-0 text-xs text-text-secondary">名称</span>
              <GrowInput
                class="min-w-0 flex-1"
                size="small"
                clearable
                :model-value="element.name"
                placeholder="指示器名称"
                @update:model-value="(v) => onPatch(element._dragKey, { name: String(v ?? '') })"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="w-12 shrink-0 text-xs text-text-secondary">最大值</span>
              <GrowInputNumber
                class="min-w-0 flex-1"
                size="small"
                :controls="false"
                :model-value="element.max ?? 100"
                @update:model-value="(v) => onPatch(element._dragKey, { max: Number(v) || 100 })"
              />
            </div>
          </div>
        </div>
      </template>
    </draggable>

    <GrowButton size="small" class="w-full" @click="onAdd">
      <GrowIconify icon="carbon:add" :size="14" class="mr-1 align-[-2px]" />
      添加指示器
    </GrowButton>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'

defineOptions({
  name: 'ChartRadarIndicatorListEditor',
})

type IndicatorItem = {
  name?: string
  max?: number
}

type DragIndicatorItem = IndicatorItem & { _dragKey: string }

const props = withDefaults(
  defineProps<{
    modelValue?: IndicatorItem[] | null
  }>(),
  {
    modelValue: () => [],
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: IndicatorItem[]]
}>()

const DEFAULT_INDICATORS: IndicatorItem[] = [
  { name: '销售', max: 100 },
  { name: '管理', max: 100 },
  { name: '信息技术', max: 100 },
  { name: '客服', max: 100 },
  { name: '研发', max: 100 },
]

const createDragKey = () =>
  `radar-indicator-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const dragList = ref<DragIndicatorItem[]>(
  DEFAULT_INDICATORS.map((item) => ({ ...item, _dragKey: createDragKey() })),
)

const toPlainList = (list: DragIndicatorItem[]): IndicatorItem[] =>
  list.map(({ _dragKey, ...item }) => item)

const syncFromProps = (value?: IndicatorItem[] | null) => {
  const incoming = value?.length ? value : DEFAULT_INDICATORS
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
    const incoming = value?.length ? value : DEFAULT_INDICATORS
    if (JSON.stringify(current) === JSON.stringify(incoming)) return
    syncFromProps(value)
  },
  { immediate: true, deep: true },
)

const emitList = () => {
  emit('update:modelValue', toPlainList(dragList.value))
}

const onPatch = (dragKey: string, patch: Partial<IndicatorItem>) => {
  dragList.value = dragList.value.map((item) =>
    item._dragKey === dragKey ? { ...item, ...patch } : item,
  )
  emitList()
}

const onRemove = (dragKey: string) => {
  if (dragList.value.length <= 3) return
  dragList.value = dragList.value.filter((item) => item._dragKey !== dragKey)
  emitList()
}

const onAdd = () => {
  const idx = dragList.value.length + 1
  dragList.value = [
    ...dragList.value,
    {
      _dragKey: createDragKey(),
      name: `指标${idx}`,
      max: 100,
    },
  ]
  emitList()
}
</script>

<style scoped lang="scss">
.radar-indicator-drag-handle {
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
