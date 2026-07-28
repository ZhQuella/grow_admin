<template>
  <div class="box-border px-3 py-3">
    <GrowForm label-width="88px" label-position="left" size="small" :show-message="false">
      <GrowFormItem label="关联类型">
        <GrowSelect
          :model-value="relation.type"
          :options="RELATION_TYPE_OPTIONS"
          size="small"
          class="w-full"
          :disabled="relation.type === 'many-to-many'"
          @update:model-value="onTypeChange"
        />
      </GrowFormItem>
      <GrowFormItem label="源表字段">
        <GrowInput :model-value="sourceLabel" size="small" disabled />
      </GrowFormItem>
      <GrowFormItem label="目标字段">
        <GrowInput :model-value="targetLabel" size="small" disabled />
      </GrowFormItem>
      <GrowFormItem v-if="relation.type === 'many-to-many'" label="中间表">
        <GrowInput :model-value="junctionLabel" size="small" disabled />
      </GrowFormItem>
      <GrowFormItem label="删除时">
        <GrowSelect
          :model-value="relation.onDelete"
          :options="REFERENTIAL_ACTION_OPTIONS"
          size="small"
          class="w-full"
          @update:model-value="(v) => emit('change', { onDelete: String(v) as any })"
        />
      </GrowFormItem>
      <GrowFormItem label="更新时">
        <GrowSelect
          :model-value="relation.onUpdate"
          :options="REFERENTIAL_ACTION_OPTIONS"
          size="small"
          class="w-full"
          @update:model-value="(v) => emit('change', { onUpdate: String(v) as any })"
        />
      </GrowFormItem>
    </GrowForm>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RELATION_TYPE_OPTIONS, REFERENTIAL_ACTION_OPTIONS } from '../mysqlTypes'
import type { DatabaseSchema, SchemaRelation, SchemaRelationType } from '../types'

defineOptions({
  name: 'RelationConfigPanel',
})

const props = defineProps<{
  relation: SchemaRelation
  schema: DatabaseSchema
}>()

const emit = defineEmits<{
  change: [patch: Partial<SchemaRelation>]
}>()

const findLabel = (tableId: string, columnId: string) => {
  const table = props.schema.tables.find((t) => t.id === tableId)
  const col = table?.columns.find((c) => c.id === columnId)
  if (!table || !col) return '-'
  return `${table.name}.${col.name}`
}

const sourceLabel = computed(() =>
  findLabel(props.relation.sourceTableId, props.relation.sourceColumnId),
)
const targetLabel = computed(() =>
  findLabel(props.relation.targetTableId, props.relation.targetColumnId),
)
const junctionLabel = computed(() => {
  if (!props.relation.junctionTableId) return '-'
  const table = props.schema.tables.find((t) => t.id === props.relation.junctionTableId)
  return table?.name ?? '-'
})

const onTypeChange = (value: string | number | null) => {
  const type = String(value) as SchemaRelationType
  if (type === 'many-to-many') return
  emit('change', { type })
}
</script>
