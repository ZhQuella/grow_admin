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
      <div class="schema-table-node__left">
        <GrowIconify
          :icon="data.table.isJunction ? 'carbon:connect' : 'carbon:data-table'"
          :size="14"
        />
        <span class="schema-table-node__title" :title="data.table.name">
          {{ data.table.name }}
        </span>
        <span v-if="data.table.isJunction" class="schema-table-node__badge">中间表</span>
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
          <span v-if="col.autoIncrement" title="自增 (IDENTITY)">AI</span>
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

    <div class="schema-table-node__footer" @click.stop @mousedown.stop>
      <GrowButton
        type="danger"
        size="small"
        class="schema-table-node__footer-btn"
        @click.stop="$emit('remove', data.table.id)"
        @mousedown.stop
      >
        <GrowIconify icon="carbon:trash-can" :size="12" class="mr-1 align-[-2px]" />
        删除
      </GrowButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { formatColumnType } from '../../static/postgresTypes'
import type { TableNodeData } from '../../utils/flowMapper'

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
  box-sizing: border-box;
  width: 340px;
  min-width: 340px;
  max-width: 400px;
  border: 1px solid var(--layout-border-color, var(--border-color));
  border-radius: 8px;
  background: var(--component-background-color);
  box-shadow: var(--card-shadow);
  font-size: 11px;
  color: var(--text-color);
  text-align: left;
  overflow: visible;
}

.schema-table-node.is-selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
}

.schema-table-node.is-junction:not(.is-selected) {
  border-color: color-mix(in srgb, var(--primary-color) 55%, var(--layout-border-color, var(--border-color)));
}

.schema-table-node__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--layout-border-color, var(--border-color));
  background: color-mix(in srgb, var(--primary-color) 8%, transparent);
}

.schema-table-node.is-junction .schema-table-node__header {
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
}

.schema-table-node__left {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
}

.schema-table-node__left :deep(.grow-iconify) {
  flex: none !important;
  flex-grow: 0 !important;
  flex-shrink: 0 !important;
  display: inline-flex !important;
  width: 14px !important;
  height: 14px !important;
  align-items: center;
  justify-content: center;
  line-height: 0;
  color: var(--text-color);
}

.schema-table-node__left :deep(.grow-iconify svg) {
  display: block;
  width: 14px;
  height: 14px;
}

.schema-table-node__title {
  overflow: hidden;
  font-weight: 600;
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
  font-weight: 600;
  line-height: 16px;
}

.schema-table-node__row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  box-sizing: border-box;
  width: 100%;
  padding: 11px 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--layout-border-color) 55%, transparent);
}

.schema-table-node__row:hover {
  background: color-mix(in srgb, var(--primary-color) 6%, transparent);
}

.schema-table-node__row.is-pk .schema-table-node__col-name {
  font-weight: 600;
}

.schema-table-node__flags {
  display: flex;
  flex-shrink: 0;
  gap: 2px;
}

.schema-table-node__flags span {
  padding: 0 3px;
  border-radius: 2px;
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  color: var(--primary-color);
  font-size: 9px;
  font-weight: 700;
  line-height: 14px;
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
  max-width: 120px;
  overflow: hidden;
  color: var(--text-color-secondary, var(--text-secondary-color));
  text-overflow: ellipsis;
  white-space: nowrap;
}

.schema-table-node__footer {
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 6px;
  padding: 8px 10px;
  border-top: 1px solid var(--layout-border-color, var(--border-color));
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  background: color-mix(in srgb, var(--text-color) 6%, var(--component-background-color));
}

.schema-table-node__footer-btn {
  margin: 0 !important;
}

.schema-handle {
  width: 8px !important;
  height: 8px !important;
  z-index: 5;
  border: 1.5px solid var(--primary-color) !important;
  background: var(--component-background-color) !important;
  pointer-events: all !important;
}
</style>
