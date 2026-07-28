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
          class="schema-table-node__type-icon"
        />
        <span class="schema-table-node__title" :title="data.table.name">
          {{ data.table.name }}
        </span>
        <span v-if="data.table.isJunction" class="schema-table-node__badge">中间表</span>
      </div>

      <GrowButton
        type="danger"
        size="small"
        class="schema-table-node__delete"
        title="删除表"
        @click.stop="$emit('remove', data.table.id)"
        @mousedown.stop
      >
        <GrowIconify icon="carbon:trash-can" :size="11" />
      </GrowButton>
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
  min-width: 200px;
  max-width: 280px;
  border: 1px solid var(--layout-border-color, var(--border-color));
  border-radius: 8px;
  background: var(--component-background-color);
  box-shadow: var(--card-shadow);
  font-size: 11px;
  color: var(--text-color);
  text-align: left;
}

.schema-table-node.is-selected {
  border-color: var(--primary-color);
}

.schema-table-node.is-junction .schema-table-node__header {
  background: var(--color-primary-a12);
}

.schema-table-node__header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  height: 36px;
  padding: 0 8px 0 10px;
  border-bottom: 1px solid var(--layout-border-color, var(--border-color));
  background: color-mix(
    in srgb,
    var(--layout-container-background-color) 70%,
    var(--component-background-color)
  );
  text-align: left;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.schema-table-node__left {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
}

/* 覆盖 .grow-iconify 的 flex-grow，避免图标把表名顶到中间 */
.schema-table-node__left :deep(.grow-iconify) {
  flex: none !important;
  flex-grow: 0 !important;
  flex-shrink: 0 !important;
  flex-basis: auto !important;
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
  min-width: 0;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
  line-height: 20px;
  color: var(--text-color);
}

.schema-table-node__badge {
  flex-shrink: 0;
  padding: 0 5px;
  border-radius: 3px;
  background: var(--primary-color);
  color: #fff;
  font-size: 10px;
  line-height: 16px;
}

/* 右侧删除：danger + small，略收窄 */
.schema-table-node__delete {
  flex-shrink: 0;
  margin-left: auto;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s ease;
}

.schema-table-node:hover .schema-table-node__delete,
.schema-table-node.is-selected .schema-table-node__delete {
  opacity: 1;
  pointer-events: auto;
}

.schema-table-node__delete :deep(.el-button),
.schema-table-node__delete :deep(.n-button),
.schema-table-node__delete :deep(.ant-btn),
.schema-table-node__delete :deep(button) {
  display: inline-flex !important;
  width: 18px !important;
  min-width: 18px !important;
  height: 18px !important;
  min-height: 18px !important;
  padding: 0 !important;
  align-items: center !important;
  justify-content: center !important;
}

.schema-table-node__delete :deep(.grow-iconify) {
  display: inline-flex !important;
  width: 12px !important;
  height: 12px !important;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.schema-table-node__delete :deep(.grow-iconify svg) {
  display: block;
  width: 12px;
  height: 12px;
}

.schema-table-node__body {
  padding: 4px 0;
  background: var(--component-background-color);
  border-radius: 0 0 8px 8px;
}

.schema-table-node__row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
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
  flex-shrink: 0;
  gap: 2px;
}

.schema-table-node__flags span {
  padding: 0 3px;
  border-radius: 2px;
  background: var(--color-primary-a16);
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
