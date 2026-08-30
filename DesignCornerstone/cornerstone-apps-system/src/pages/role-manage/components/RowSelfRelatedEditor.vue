<template>
  <div class="row-self">
    <label class="row-self__item">
      <GrowCheckbox
        :model-value="modelValue.createdBySelf"
        @update:model-value="(value) => emitChange({ createdBySelf: Boolean(value) })"
      />
      <span>成员本人创建的记录</span>
    </label>
    <label class="row-self__item">
      <GrowCheckbox
        :model-value="modelValue.fieldContainsSelf"
        @update:model-value="(value) => emitChange({ fieldContainsSelf: Boolean(value) })"
      />
      <span>字段包含成员本人的记录</span>
    </label>
    <div v-if="modelValue.fieldContainsSelf" class="row-self__fields">
      <p v-if="!columns.length" class="row-self__hint">该菜单暂无可用字段，无法勾选字段</p>
      <label
        v-for="col in columns"
        :key="col.id"
        class="row-self__field"
      >
        <GrowCheckbox
          :model-value="modelValue.columnIds.includes(col.id)"
          :disabled="!isAvailable(col)"
          @update:model-value="(value) => toggleColumn(col.id, Boolean(value))"
        />
        <span>{{ fieldLabel(col) }}</span>
        <GrowTag v-if="!isAvailable(col)" type="info" size="small">不可用</GrowTag>
      </label>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { SystemMenuColumn } from '../../../types/systemMenuColumn'
import type { SelfRelatedConfig } from '../../../types/systemRole'

defineOptions({ name: 'RowSelfRelatedEditor' })

const props = defineProps<{
  modelValue: SelfRelatedConfig
  columns: SystemMenuColumn[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SelfRelatedConfig]
}>()

function isAvailable(col: SystemMenuColumn) {
  return col.enabled !== false && col.queryFilter !== false
}

function fieldLabel(col: SystemMenuColumn) {
  return col.tableTitle ? `${col.tableTitle} / ${col.title}` : col.title
}

function emitChange(patch: Partial<SelfRelatedConfig>) {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}

function toggleColumn(id: string, checked: boolean) {
  const set = new Set(props.modelValue.columnIds)
  if (checked) set.add(id)
  else set.delete(id)
  emitChange({ columnIds: [...set] })
}
</script>

<style scoped>
.row-self {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0 4px 28px;
}

.row-self__item,
.row-self__field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: var(--text-color);
  font-size: 13px;
  cursor: pointer;
}

.row-self__fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0 0 24px;
}

.row-self__hint {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 12px;
}
</style>
