<template>
  <div class="column-edit-form">
    <div v-if="isSpecial" class="column-edit-form__row">
      <span class="column-edit-form__label">类型</span>
      <span class="column-edit-form__type">{{ specialLabel }}</span>
    </div>
    <div v-if="!isSelection" class="column-edit-form__row">
      <span class="column-edit-form__label">标题</span>
      <GrowInput
        size="small"
        :model-value="modelValue.title"
        placeholder="表头标题"
        @update:model-value="(v) => patch({ title: String(v ?? '') })"
      />
    </div>
    <div v-if="!isSpecial" class="column-edit-form__row">
      <span class="column-edit-form__label">字段</span>
      <GrowInput
        size="small"
        :model-value="modelValue.field"
        placeholder="field / prop"
        :disabled="hasChildren"
        @update:model-value="(v) => patch({ field: String(v ?? '') })"
      />
    </div>
    <div class="column-edit-form__row">
      <span class="column-edit-form__label">宽度</span>
      <GrowInput
        size="small"
        :model-value="stringify(modelValue.width)"
        placeholder="如 120 或 120px"
        @update:model-value="(v) => patch({ width: normalizeSize(v) })"
      />
    </div>
    <div v-if="!isSpecial" class="column-edit-form__row">
      <span class="column-edit-form__label">最小宽</span>
      <GrowInput
        size="small"
        :model-value="stringify(modelValue.minWidth)"
        placeholder="如 100"
        @update:model-value="(v) => patch({ minWidth: normalizeSize(v) })"
      />
    </div>
    <div class="column-edit-form__row column-edit-form__row--top">
      <span class="column-edit-form__label">单元格对齐</span>
      <div class="column-edit-form__field">
        <GrowRadioButtonGroup
          size="small"
          class="column-edit-form__control"
          :options="TABLE_COLUMN_ALIGN_OPTIONS"
          :model-value="toOption(modelValue.align)"
          @update:model-value="(v) => patchAlign('align', v)"
        />
        <p v-if="!isSpecial" class="column-edit-form__tip">仅影响表体单元格，不联动表头</p>
      </div>
    </div>
    <div
      v-if="!isSelection"
      class="column-edit-form__row column-edit-form__row--top"
    >
      <span class="column-edit-form__label">表头对齐</span>
      <div class="column-edit-form__field">
        <GrowRadioButtonGroup
          size="small"
          class="column-edit-form__control"
          :options="TABLE_COLUMN_ALIGN_OPTIONS"
          :model-value="toOption(modelValue.headerAlign)"
          @update:model-value="(v) => patchAlign('headerAlign', v)"
        />
        <p v-if="!isSpecial" class="column-edit-form__tip">仅影响表头文字</p>
      </div>
    </div>
    <div class="column-edit-form__row column-edit-form__row--top">
      <span class="column-edit-form__label">固定</span>
      <div class="column-edit-form__field">
        <GrowRadioButtonGroup
          size="small"
          class="column-edit-form__control"
          :options="TABLE_COLUMN_FIXED_OPTIONS"
          :model-value="fixedOption"
          @update:model-value="onFixedChange"
        />
        <p v-if="depth > 0 && !isSpecial" class="column-edit-form__tip">
          多级表头下固定作用于整组一级列，子列设置会提升到所属分组
        </p>
      </div>
    </div>
    <template v-if="!isSpecial">
      <div class="column-edit-form__row">
        <span class="column-edit-form__label">排序</span>
        <GrowRadioButtonGroup
          size="small"
          class="column-edit-form__control"
          :options="TABLE_COLUMN_SORTABLE_OPTIONS"
          :model-value="sortableOption"
          @update:model-value="onSortableChange"
        />
      </div>
      <div class="column-edit-form__row">
        <span class="column-edit-form__label">可拖拽列宽</span>
        <GrowSwitch
          size="small"
          :model-value="Boolean(modelValue.resizable)"
          @update:model-value="(v) => patch({ resizable: Boolean(v) })"
        />
      </div>
      <div class="column-edit-form__row">
        <span class="column-edit-form__label">溢出提示</span>
        <GrowSwitch
          size="small"
          :model-value="Boolean(modelValue.showOverflowTooltip)"
          @update:model-value="(v) => patch({ showOverflowTooltip: Boolean(v) })"
        />
      </div>
    </template>
    <div class="column-edit-form__row">
      <span class="column-edit-form__label">显示</span>
      <GrowSwitch
        size="small"
        :model-value="modelValue.visible !== false"
        @update:model-value="(v) => patch({ visible: Boolean(v) })"
      />
    </div>
    <template v-if="!isSpecial">
      <div class="column-edit-form__row">
        <span class="column-edit-form__label">columnKey</span>
        <GrowInput
          size="small"
          :model-value="modelValue.columnKey"
          placeholder="可选"
          @update:model-value="(v) => patch({ columnKey: String(v ?? '') })"
        />
      </div>
      <div class="column-edit-form__row">
        <span class="column-edit-form__label">class</span>
        <GrowInput
          size="small"
          :model-value="modelValue.className"
          placeholder="列 class"
          @update:model-value="(v) => patch({ className: String(v ?? '') })"
        />
      </div>
      <div class="column-edit-form__row">
        <span class="column-edit-form__label">表头 class</span>
        <GrowInput
          size="small"
          :model-value="modelValue.labelClassName"
          placeholder="表头 class"
          @update:model-value="(v) => patch({ labelClassName: String(v ?? '') })"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  isSpecialTableColumn,
  TABLE_COLUMN_ALIGN_OPTIONS,
  TABLE_COLUMN_FIXED_OPTIONS,
  TABLE_COLUMN_OPTION_NONE,
  TABLE_COLUMN_SORTABLE_OPTIONS,
  TABLE_COLUMN_SPECIAL_LABEL,
  type DesignerTableColumn,
  type TableColumnAlign,
} from '../../static/tableColumns'
import {
  clearFixedDeep,
  resolveColumnFixed,
} from '../../static/tableColumnUtils'

defineOptions({ name: 'ColumnEditForm' })

const props = defineProps<{
  modelValue: DesignerTableColumn
  depth?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DesignerTableColumn]
}>()

const depth = computed(() => props.depth ?? 0)
const hasChildren = computed(() => Boolean(props.modelValue.children?.length))
const isSpecial = computed(() => isSpecialTableColumn(props.modelValue))
const isSelection = computed(() => props.modelValue.type === 'selection')
const specialLabel = computed(() =>
  isSpecial.value ? TABLE_COLUMN_SPECIAL_LABEL[props.modelValue.type] : '',
)

const stringify = (value: unknown) =>
  value == null || value === '' ? '' : String(value)

const normalizeSize = (raw: string | null | undefined) => {
  const str = String(raw ?? '').trim()
  if (!str) return undefined
  const num = Number(str)
  return Number.isFinite(num) ? num : str
}

const patch = (partial: Partial<DesignerTableColumn>) => {
  emit('update:modelValue', { ...props.modelValue, ...partial })
}

const toOption = (raw: unknown) =>
  raw == null || raw === '' || raw === false ? TABLE_COLUMN_OPTION_NONE : String(raw)

const fromOption = (value: string | number | null | undefined) => {
  if (value == null || value === '' || value === TABLE_COLUMN_OPTION_NONE) return ''
  return String(value)
}

const patchAlign = (
  key: 'align' | 'headerAlign',
  value: string | number | null | undefined,
) => {
  patch({ [key]: fromOption(value) as TableColumnAlign | '' })
}

const fixedOption = computed(() => {
  const fixed = resolveColumnFixed(props.modelValue)
  if (fixed === true || fixed === 'left') return 'left'
  if (fixed === 'right') return 'right'
  return TABLE_COLUMN_OPTION_NONE
})

const onFixedChange = (value: string | number | null | undefined) => {
  const next = fromOption(value)
  if (!next) {
    emit('update:modelValue', clearFixedDeep(props.modelValue))
    return
  }
  if (depth.value === 0) {
    emit('update:modelValue', {
      ...clearFixedDeep(props.modelValue),
      fixed: next as 'left' | 'right',
    })
    return
  }
  patch({ fixed: next as 'left' | 'right' })
}

const sortableOption = computed(() => {
  const sortable = props.modelValue.sortable
  if (sortable === true) return 'true'
  if (sortable === 'custom') return 'custom'
  return TABLE_COLUMN_OPTION_NONE
})

const onSortableChange = (value: string | number | null | undefined) => {
  const next = fromOption(value)
  if (next === 'true') patch({ sortable: true })
  else if (next === 'custom') patch({ sortable: 'custom' })
  else patch({ sortable: '' })
}
</script>

<style scoped lang="scss">
.column-edit-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 10px;
  overflow: visible;
  border-radius: 4px;
  background: var(--layout-background-color, #f5f7fa);
}

.column-edit-form__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-edit-form__row--top {
  align-items: flex-start;
}

.column-edit-form__field {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.column-edit-form__tip {
  margin: 0;
  font-size: 11px;
  line-height: 1.4;
  color: var(--text-color-secondary, #909399);
}

.column-edit-form__label {
  flex: 0 0 72px;
  font-size: 12px;
  color: var(--text-color-secondary, #909399);
}

.column-edit-form__type {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-color, #303133);
}

.column-edit-form__control {
  flex: 1;
  min-width: 0;
}

.column-edit-form__row :deep(.el-input),
.column-edit-form__row :deep(.n-input),
.column-edit-form__row :deep(.el-radio-group),
.column-edit-form__row :deep(.n-radio-group) {
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}
</style>
