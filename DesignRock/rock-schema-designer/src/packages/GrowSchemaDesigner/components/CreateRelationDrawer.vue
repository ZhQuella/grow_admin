<template>
  <GrowDrawer
    :model-value="visible"
    title="创建关联"
    direction="rtl"
    size="360px"
    :destroy-on-close="true"
    @update:model-value="onVisible"
  >
    <div class="box-border px-3 py-3">
      <p class="mb-3 mt-0 text-xs text-text-secondary">
        从
        <strong>{{ sourceLabel }}</strong>
        连接到
        <strong>{{ targetLabel }}</strong>
      </p>

      <GrowForm label-width="88px" label-position="left" size="small" :show-message="false">
        <GrowFormItem label="关联类型">
          <GrowSelect
            :model-value="form.type"
            :options="RELATION_TYPE_OPTIONS"
            size="small"
            class="w-full"
            @update:model-value="(v) => (form.type = String(v) as SchemaRelationType)"
          />
        </GrowFormItem>
        <GrowFormItem label="ON DELETE">
          <GrowSelect
            :model-value="form.onDelete"
            :options="REFERENTIAL_ACTION_OPTIONS"
            size="small"
            class="w-full"
            @update:model-value="(v) => (form.onDelete = String(v) as SchemaReferentialAction)"
          />
        </GrowFormItem>
        <GrowFormItem label="ON UPDATE">
          <GrowSelect
            :model-value="form.onUpdate"
            :options="REFERENTIAL_ACTION_OPTIONS"
            size="small"
            class="w-full"
            @update:model-value="(v) => (form.onUpdate = String(v) as SchemaReferentialAction)"
          />
        </GrowFormItem>
      </GrowForm>

      <p v-if="form.type === 'many-to-many'" class="mt-2 text-xs text-text-secondary">
        多对多将自动创建中间表，并生成两端外键字段。
      </p>
      <p v-else class="mt-2 text-xs text-text-secondary">
        一对一 / 一对多：若连到目标表主键，将自动创建外键
        <code>{{ autoFkName }}</code>；若连到普通字段，则将该字段视为外键。
      </p>

      <div class="mt-4 flex justify-end gap-2">
        <GrowButton size="small" @click="onVisible(false)">取消</GrowButton>
        <GrowButton size="small" type="primary" @click="onConfirm">创建</GrowButton>
      </div>
    </div>
  </GrowDrawer>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { RELATION_TYPE_OPTIONS, REFERENTIAL_ACTION_OPTIONS } from '../mysqlTypes'
import type { SchemaReferentialAction, SchemaRelationType, SchemaTable } from '../types'

defineOptions({
  name: 'CreateRelationDrawer',
})

const props = defineProps<{
  visible: boolean
  sourceTable?: SchemaTable | null
  sourceColumnId?: string | null
  targetTable?: SchemaTable | null
  targetColumnId?: string | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [
    payload: {
      type: SchemaRelationType
      onDelete: SchemaReferentialAction
      onUpdate: SchemaReferentialAction
    },
  ]
}>()

const form = reactive<{
  type: SchemaRelationType
  onDelete: SchemaReferentialAction
  onUpdate: SchemaReferentialAction
}>({
  type: 'one-to-many',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
})

watch(
  () => props.visible,
  (v) => {
    if (v) {
      form.type = 'one-to-many'
      form.onDelete = 'RESTRICT'
      form.onUpdate = 'CASCADE'
    }
  },
)

const findColName = (table?: SchemaTable | null, columnId?: string | null) => {
  if (!table || !columnId) return '?'
  return table.columns.find((c) => c.id === columnId)?.name ?? '?'
}

const sourceLabel = computed(
  () => `${props.sourceTable?.name ?? '?'}.${findColName(props.sourceTable, props.sourceColumnId)}`,
)
const targetLabel = computed(
  () => `${props.targetTable?.name ?? '?'}.${findColName(props.targetTable, props.targetColumnId)}`,
)
const autoFkName = computed(() => `${props.sourceTable?.name ?? 'ref'}_id`)

const onVisible = (value: boolean) => {
  emit('update:visible', value)
}

const onConfirm = () => {
  emit('confirm', {
    type: form.type,
    onDelete: form.onDelete,
    onUpdate: form.onUpdate,
  })
}
</script>
