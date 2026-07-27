<template>
  <div class="flex w-full flex-col gap-2">
    <draggable
      v-model="dragList"
      item-key="_dragKey"
      handle=".color-list-drag-handle"
      :animation="180"
      class="flex w-full flex-col gap-2"
      @end="emitList"
    >
      <template #item="{ element, index }">
        <div
          class="box-border flex items-center gap-2 rounded-md border border-solid border-border bg-layout/40 px-2.5 py-1.5"
        >
          <span class="color-list-drag-handle" title="拖拽排序">
            <GrowIconify icon="carbon:draggable" :size="14" />
          </span>
          <span class="w-10 shrink-0 text-xs text-text-secondary">{{ index + 1 }}</span>
          <GrowColorPicker
            class="min-w-0 flex-1"
            size="small"
            show-alpha
            :model-value="element.color || null"
            @update:model-value="(v) => onPatch(element._dragKey, String(v ?? ''))"
          />
          <GrowButton
            text
            size="small"
            type="danger"
            class="!px-1"
            :disabled="dragList.length <= 1"
            title="删除颜色"
            @click="onRemove(element._dragKey)"
          >
            <GrowIconify icon="carbon:trash-can" :size="14" />
          </GrowButton>
        </div>
      </template>
    </draggable>

    <GrowButton size="small" class="w-full" @click="onAdd">
      <GrowIconify icon="carbon:add" :size="14" class="mr-1 align-[-2px]" />
      添加颜色
    </GrowButton>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'

defineOptions({
  name: 'ChartColorListEditor',
})

type DragColorItem = {
  _dragKey: string
  color: string
}

const props = withDefaults(
  defineProps<{
    modelValue?: string[] | string | null
  }>(),
  {
    modelValue: () => [],
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const DEFAULT_COLORS = ['#77EADF', '#26C3BE', '#64AFE9', '#428BD4']

const createDragKey = () =>
  `color-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const normalizeIncoming = (value?: string[] | string | null): string[] => {
  if (Array.isArray(value) && value.length) {
    return value.map((item) => String(item || '').trim()).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/[,，]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return [...DEFAULT_COLORS]
}

const dragList = ref<DragColorItem[]>(
  DEFAULT_COLORS.map((color) => ({ _dragKey: createDragKey(), color })),
)

const toPlainList = (list: DragColorItem[]) => list.map((item) => item.color)

const syncFromProps = (value?: string[] | string | null) => {
  const incoming = normalizeIncoming(value)
  const prevKeys = dragList.value.map((item) => item._dragKey)
  dragList.value = incoming.map((color, index) => ({
    color,
    _dragKey: prevKeys[index] ?? createDragKey(),
  }))
}

watch(
  () => props.modelValue,
  (value) => {
    const current = toPlainList(dragList.value)
    const incoming = normalizeIncoming(value)
    if (JSON.stringify(current) === JSON.stringify(incoming)) return
    syncFromProps(value)
  },
  { immediate: true, deep: true },
)

const emitList = () => {
  emit('update:modelValue', toPlainList(dragList.value))
}

const onPatch = (dragKey: string, color: string) => {
  dragList.value = dragList.value.map((item) =>
    item._dragKey === dragKey ? { ...item, color } : item,
  )
  emitList()
}

const onRemove = (dragKey: string) => {
  if (dragList.value.length <= 1) return
  dragList.value = dragList.value.filter((item) => item._dragKey !== dragKey)
  emitList()
}

const onAdd = () => {
  dragList.value = [
    ...dragList.value,
    {
      _dragKey: createDragKey(),
      color: '#67F9D8',
    },
  ]
  emitList()
}
</script>

<style scoped lang="scss">
.color-list-drag-handle {
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
