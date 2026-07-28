<template>
  <div
    class="schema-table-node group"
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
        class="schema-table-node__type-icon"
      />
      <span class="schema-table-node__title">{{ data.table.name }}</span>
      <span v-if="data.table.isJunction" class="schema-table-node__badge">中间表</span>
      <div class="schema-table-node__actions" @click.stop>
        <GrowButton
          text
          size="small"
          class="schema-table-node__action"
          title="删除表"
          @click.stop="$emit('remove', data.table.id)"
          @mousedown.stop
        >
          <GrowIconify icon="carbon:trash-can" :size="13" />
        </GrowButton>
      </div>
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
  remove: [tableId: string]
}>()
</script>

<style scoped>
.schema-table-node {
  position: relative;
  min-width: 200px;
  max-width: 280px;
  border: 1px solid var(--layout-border-color, var(--border-color));
  border-radius: 6px;
  background: var(--component-background-color);
  box-shadow: var(--card-shadow);
  overflow: visible;
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

.schema-table-node__actions {
  display: none;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  height: 22px;
  margin-left: 4px;
  padding: 0 1px;
  border-radius: 4px;
  background: var(--primary-color);
  color: #fff;
}

.schema-table-node:hover .schema-table-node__actions,
.schema-table-node.is-selected .schema-table-node__actions {
  display: inline-flex;
}

.schema-table-node__action {
  display: inline-flex !important;
  width: 22px !important;
  min-width: 22px !important;
  height: 22px !important;
  min-height: 22px !important;
  padding: 0 !important;
  margin: 0 !important;
  align-items: center;
  justify-content: center;
  border-radius: 4px !important;
  color: #fff !important;
  opacity: 0.92;
  line-height: 0 !important;
}

.schema-table-node__action:hover {
  background: rgba(237, 111, 111, 0.45) !important;
  opacity: 1;
  color: #fff !important;
}

.schema-table-node__action :deep(.grow-iconify) {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  width: 13px;
  height: 13px;
  line-height: 0;
  color: inherit;
}

.schema-table-node__action :deep(.grow-iconify svg) {
  display: block;
  width: 13px;
  height: 13px;
}

.schema-table-node__header {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 6px 8px 6px 10px;
  border-bottom: 1px solid var(--layout-border-color, var(--border-color));
  border-radius: 6px 6px 0 0;
  background: color-mix(in srgb, var(--layout-container-background-color) 70%, var(--component-background-color));
  font-weight: 600;
  overflow: hidden;
}

.schema-table-node__type-icon {
  flex-shrink: 0;
}

.schema-table-node__header :deep(.schema-table-node__type-icon) {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  line-height: 0;
}

.schema-table-node__header :deep(.schema-table-node__type-icon svg) {
  display: block;
  width: 14px;
  height: 14px;
}

.schema-table-node__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 20px;
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
  border-radius: 0 0 6px 6px;
  overflow: hidden;
  background: var(--component-background-color);
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
