<template>
  <div class="row-filter">
    <div class="row-filter__head">筛选</div>
    <p v-if="!fieldOptions.length" class="row-filter__hint">该菜单暂无表定义列，无法配置筛选条件</p>
    <template v-else>
      <div
        v-for="(row, index) in modelValue"
        :key="row.id"
        class="row-filter__row"
      >
        <GrowSelect
          :model-value="row.columnId"
          :options="fieldOptions"
          label="label"
          value="value"
          placeholder="选择字段"
          filterable
          clearable
          @update:model-value="(value) => onFieldChange(index, String(value || ''))"
        />
        <GrowSelect
          :model-value="row.operator"
          :options="operatorOptions(row.columnId)"
          label="label"
          value="value"
          placeholder="条件"
          @update:model-value="(value) => patch(index, { operator: toOperator(value, row.columnId) })"
        />
        <FilterPersonSelect
          v-if="columnType(row.columnId) === 'person'"
          :model-value="row.value"
          @update:model-value="(value) => patch(index, { value })"
        />
        <FilterDeptSelect
          v-else-if="columnType(row.columnId) === 'dept'"
          :model-value="row.value"
          :tree="deptTree"
          @update:model-value="(value) => patch(index, { value })"
        />
        <GrowInputNumber
          v-else-if="columnType(row.columnId) === 'number'"
          :model-value="toNumber(row.value[0])"
          controls-position="right"
          placeholder="请输入"
          @update:model-value="(value) => patchScalar(index, value)"
        />
        <GrowDatePicker
          v-else-if="columnType(row.columnId) === 'date'"
          :model-value="row.value[0] || ''"
          value-format="YYYY-MM-DD"
          clearable
          placeholder="请选择"
          @update:model-value="(value) => patchScalar(index, value)"
        />
        <GrowSelect
          v-else-if="columnType(row.columnId) === 'boolean'"
          :model-value="row.value[0] || ''"
          :options="BOOLEAN_OPTIONS"
          label="label"
          value="value"
          clearable
          placeholder="请选择"
          @update:model-value="(value) => patchScalar(index, value)"
        />
        <GrowInput
          v-else
          :model-value="row.value[0] || ''"
          clearable
          placeholder="请输入"
          @update:model-value="(value) => patchScalar(index, value)"
        />
        <GrowButton link type="danger" @click="remove(index)">删除</GrowButton>
      </div>
      <GrowButton link type="primary" @click="add">+ 添加条件</GrowButton>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { ColumnType, SystemMenuColumn } from '../../../types/systemMenuColumn'
import {
  type FilterOperator,
  type RowFilterCondition,
  type SystemDeptTreeNode,
} from '../../../types/systemRole'
import { emptyFilterCondition, isFilterOperator, operatorsForColumnType } from '../use/helpers'
import FilterDeptSelect from './FilterDeptSelect.vue'
import FilterPersonSelect from './FilterPersonSelect.vue'

defineOptions({ name: 'RowFilterEditor' })

const BOOLEAN_OPTIONS = [
  { label: '是', value: 'true' },
  { label: '否', value: 'false' },
]

const props = defineProps<{
  modelValue: RowFilterCondition[]
  columns: SystemMenuColumn[]
  deptTree: SystemDeptTreeNode[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: RowFilterCondition[]]
}>()

const fieldOptions = computed(() => {
  const enabled = props.columns.filter((item) => item.enabled !== false)
  const multiTable = new Set(enabled.map((item) => item.tableCode)).size > 1
  return enabled.map((item) => ({
    value: item.id,
    label: multiTable && item.tableTitle ? `${item.tableTitle} / ${item.title}` : item.title,
  }))
})

const columnMap = computed(() => new Map(props.columns.map((item) => [item.id, item])))

function columnType(columnId: string): ColumnType {
  const type = columnMap.value.get(columnId)?.columnType
  return type || 'string'
}

function operatorOptions(columnId: string) {
  return operatorsForColumnType(columnType(columnId))
}

function toOperator(value: unknown, columnId: string): FilterOperator {
  const next = String(value || '')
  if (isFilterOperator(next) && operatorOptions(columnId).some((item) => item.value === next)) {
    return next
  }
  return 'eq'
}

function toNumber(value: string | undefined) {
  if (value == null || value === '') return undefined
  const next = Number(value)
  return Number.isNaN(next) ? undefined : next
}

function patch(index: number, partial: Partial<RowFilterCondition>) {
  emit('update:modelValue', props.modelValue.map((item, i) => (
    i === index ? { ...item, ...partial } : item
  )))
}

function patchScalar(index: number, value: unknown) {
  const next = value == null || value === '' ? [] : [String(value)]
  patch(index, { value: next })
}

function onFieldChange(index: number, columnId: string) {
  patch(index, {
    columnId,
    operator: 'eq',
    value: [],
  })
}

function add() {
  emit('update:modelValue', [...props.modelValue, emptyFilterCondition()])
}

function remove(index: number) {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index))
}
</script>

<style scoped>
.row-filter {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0 4px 28px;
}

.row-filter__head {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.row-filter__row {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) 108px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}

.row-filter__row :deep(.el-select),
.row-filter__row :deep(.n-select),
.row-filter__row :deep(.el-input),
.row-filter__row :deep(.n-input),
.row-filter__row :deep(.el-input-number),
.row-filter__row :deep(.el-date-editor) {
  width: 100%;
}

.row-filter__hint {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 12px;
}
</style>
