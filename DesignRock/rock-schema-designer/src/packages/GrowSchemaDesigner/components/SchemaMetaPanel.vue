<template>
  <div class="box-border px-3 py-3">
    <GrowForm label-width="72px" label-position="left" size="small" :show-message="false">
      <GrowFormItem label="库名">
        <GrowInput
          :model-value="schema.name"
          size="small"
          placeholder="database_name"
          @update:model-value="(v) => emit('change', { name: String(v ?? '') })"
        />
      </GrowFormItem>
      <GrowFormItem label="注释">
        <GrowInput
          :model-value="schema.comment || ''"
          size="small"
          placeholder="数据库注释"
          @update:model-value="(v) => emit('change', { comment: String(v ?? '') })"
        />
      </GrowFormItem>
      <GrowFormItem label="方言">
        <GrowInput model-value="MySQL" size="small" disabled />
      </GrowFormItem>
    </GrowForm>

    <div class="mt-3 rounded border border-solid border-border bg-layout px-3 py-2 text-xs text-text-secondary">
      <div>表数量：{{ schema.tables.length }}</div>
      <div class="mt-1">关联数量：{{ schema.relations.length }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DatabaseSchema } from '../types'

defineOptions({
  name: 'SchemaMetaPanel',
})

defineProps<{
  schema: DatabaseSchema
}>()

const emit = defineEmits<{
  change: [patch: Partial<Pick<DatabaseSchema, 'name' | 'comment'>>]
}>()
</script>
