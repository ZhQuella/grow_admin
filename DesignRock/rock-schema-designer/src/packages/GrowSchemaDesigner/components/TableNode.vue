<template>
  <div
    class="schema-table-node"
    :class="{
      'is-selected': data.selected,
      'is-junction': data.table.isJunction,
    }"
    @click.stop="$emit('select', data.table.id)"
  >
    <div class="schema-table-node__header">
      <GrowIconify
        :icon="data.table.isJunction ? 'carbon:connect' : 'carbon:data-table'"
        :size="14"
        class="shrink-0"
      />
      <span class="schema-table-node__title">{{ data.table.name }}</span>
      <span v-if="data.table.isJunction" class="schema-table-node__badge">中间表</span>
    </div>

    <div class="schema-table-node__body">
      <div
        v-for="col in data.table.columns"
        :key="col.id"
        class="schema-table-node__row"
        :class="{ 'is-pk': col.primaryKey }"
      >
        <Handle
          :id="`in-${col.id}`"
          type="target"
          :position="Position.Left"
          class="schema-handle"
        />
        <div class="schema-table-node__flags">
          <span v-if="col.primaryKey" title="主键">PK</span>
          <span v-if="col.autoIncrement" title="自增">AI</span>
          <span v-if="col.unique" title="唯一">UQ</span>
          <span v-if="!col.nullable" title="非空">NN</span>
          <span v-if="col.indexed && !col.primaryKey && !col.unique" title="索引">IX</span>
        </div>
        <span class="schema-table-node__col-name">{{ col.name }}</span>
        <span class="schema-table-node__col-type">
          {{ formatColumnType(col.type, col.length, col.scale) }}
        </span>
        <Handle
          :id="`out-${col.id}`"
          type="source"
          :position="Position.Right"
          class="schema-handle"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { formatColumnType } from '../mysqlTypes'
import type { TableNodeData } from '../flowMapper'

defineOptions({
  name: 'SchemaTableNode',
})

defineProps<{
  data: TableNodeData
}>()

defineEmits<{
  select: [tableId: string]
}>()
</script>

<style scoped>
.schema-table-node {
  min-width: 200px;
  max-width: 280px;
  border: 1px solid var(--layout-border-color, var(--border-color));
  border-radius: 6px;
  background: var(--component-background-color);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  font-size: 11px;
  color: var(--text-color);
}

.schema-table-node.is-selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
}

.schema-table-node.is-junction .schema-table-node__header {
  background: var(--color-primary-a12);
}

.schema-table-node__header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--layout-border-color, var(--border-color));
  background: color-mix(in srgb, var(--layout-container-background-color) 70%, var(--component-background-color));
  font-weight: 600;
}

.schema-table-node__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.schema-table-node__badge {
  flex-shrink: 0;
  padding: 0 5px;
  border-radius: 3px;
  background: var(--primary-color);
  color: #fff;
  font-size: 10px;
  font-weight: 500;
  line-height: 16px;
}

.schema-table-node__body {
  padding: 4px 0;
}

.schema-table-node__row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 26px;
  padding: 2px 14px;
}

.schema-table-node__row:hover {
  background: var(--color-primary-a08);
}

.schema-table-node__row.is-pk .schema-table-node__col-name {
  font-weight: 600;
}

.schema-table-node__flags {
  display: flex;
  gap: 2px;
  min-width: 0;
  flex-shrink: 0;
}

.schema-table-node__flags span {
  padding: 0 3px;
  border-radius: 2px;
  background: var(--color-primary-a16);
  color: var(--primary-color);
  font-size: 9px;
  line-height: 14px;
  font-weight: 700;
}

.schema-table-node__col-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.schema-table-node__col-type {
  flex-shrink: 0;
  color: var(--text-color-secondary);
  font-size: 11px;
}

.schema-handle {
  width: 8px !important;
  height: 8px !important;
  border: 1.5px solid var(--primary-color) !important;
  background: var(--component-background-color) !important;
}
</style>
