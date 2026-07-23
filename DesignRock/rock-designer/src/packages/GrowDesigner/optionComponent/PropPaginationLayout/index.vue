<template>
  <div class="prop-pagination-layout">
    <draggable
      class="prop-pagination-layout__list"
      :list="items"
      item-key="value"
      handle=".prop-pagination-layout__drag"
      :animation="180"
      @change="emitChange"
    >
      <template #item="{ element }">
        <div
          class="prop-pagination-layout__row"
          :class="{ 'is-enabled': element.enabled }"
        >
          <span class="prop-pagination-layout__drag" title="拖拽排序">
            <GrowIconify icon="carbon:draggable" :size="14" />
          </span>
          <GrowCheckbox
            class="prop-pagination-layout__check"
            :model-value="element.enabled"
            @update:model-value="(v) => onToggle(element.value, Boolean(v))"
          >
            <span class="prop-pagination-layout__label">{{ element.label }}</span>
            <span class="prop-pagination-layout__code">{{ element.value }}</span>
          </GrowCheckbox>
        </div>
      </template>
    </draggable>
    <p class="prop-pagination-layout__preview">
      layout：{{ preview || '（未选择）' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import {
  DEFAULT_PAGINATION_LAYOUT,
  parsePaginationLayout,
  stringifyPaginationLayout,
  type PaginationLayoutItem,
} from '../../static/paginationLayout'

defineOptions({ name: 'PropPaginationLayout' })

const props = withDefaults(
  defineProps<{
    modelValue?: string
  }>(),
  {
    modelValue: DEFAULT_PAGINATION_LAYOUT,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const items = ref<PaginationLayoutItem[]>(
  parsePaginationLayout(props.modelValue),
)

watch(
  () => props.modelValue,
  (value) => {
    const next = stringifyPaginationLayout(items.value)
    const incoming = String(value ?? '').trim()
    if (incoming === next) return
    items.value = parsePaginationLayout(value)
  },
)

const preview = computed(() => stringifyPaginationLayout(items.value))

const emitChange = () => {
  emit('update:modelValue', stringifyPaginationLayout(items.value))
}

const onToggle = (value: string, enabled: boolean) => {
  const target = items.value.find((item) => item.value === value)
  if (!target) return
  target.enabled = enabled
  emitChange()
}
</script>

<style scoped lang="scss">
.prop-pagination-layout {
  width: 100%;
}

.prop-pagination-layout__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.prop-pagination-layout__row {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 30px;
  padding: 2px 4px;
  border-radius: 4px;
  opacity: 0.55;

  &.is-enabled {
    opacity: 1;
    background: var(--layout-background-color, #f5f7fa);
  }
}

.prop-pagination-layout__drag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: var(--text-color-secondary, #909399);
  cursor: grab;
  line-height: 0;
  flex-shrink: 0;

  :deep(.grow-iconify),
  :deep(svg) {
    display: block;
    margin: auto;
    line-height: 0;
  }
}

.prop-pagination-layout__check {
  flex: 1;
  min-width: 0;
}

.prop-pagination-layout__label {
  margin-right: 6px;
  font-size: 12px;
  color: var(--text-color, #303133);
}

.prop-pagination-layout__code {
  font-size: 11px;
  color: var(--text-color-secondary, #909399);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.prop-pagination-layout__preview {
  margin: 8px 0 0;
  font-size: 11px;
  line-height: 1.4;
  color: var(--text-color-secondary, #909399);
  word-break: break-all;
}
</style>
