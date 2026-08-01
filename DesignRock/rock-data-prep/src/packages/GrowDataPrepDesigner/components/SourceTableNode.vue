<template>
  <div
    class="prep-table-node"
    :class="{ 'is-selected': data.selected }"
    @click.stop="$emit('select', data.source.id)"
  >
    <Handle type="target" :position="Position.Left" class="prep-handle" />
    <Handle type="source" :position="Position.Right" class="prep-handle" />
    <div class="prep-table-node__header">
      <div class="prep-table-node__left">
        <GrowIconify icon="carbon:data-table" :size="14" />
        <span class="prep-table-node__title" :title="data.source.tableName">
          {{ data.source.tableName }}
        </span>
        <span v-if="data.schemaName" class="prep-table-node__schema" :title="data.schemaName">
          {{ data.schemaName }}
        </span>
        <span class="prep-table-node__alias">as {{ data.source.alias }}</span>
      </div>
      <GrowButton
        type="danger"
        size="small"
        class="prep-table-node__delete"
        title="移除表"
        @click.stop="$emit('remove', data.source.id)"
        @mousedown.stop
      >
        <GrowIconify icon="carbon:trash-can" :size="11" />
      </GrowButton>
    </div>

    <div class="prep-table-node__body">
      <div
        v-for="col in data.columns"
        :key="col.id"
        class="prep-table-node__row"
        :class="{
          'is-dimension': isDimension(col.name),
          'is-measure': isMeasure(col.name),
          'is-both': isDimension(col.name) && isMeasure(col.name),
        }"
        @click.stop="$emit('select-column', data.source.id, col.id)"
      >
        <span class="prep-table-node__col-name">{{ col.name }}</span>
        <span class="prep-table-node__col-type">{{ col.type }}</span>
        <span class="prep-table-node__tags">
          <button
            type="button"
            class="prep-tag dim"
            :class="{ 'is-active': isDimension(col.name) }"
            title="设为维度"
            @click.stop="$emit('toggle-dimension', data.source.id, col.id)"
            @mousedown.stop
          >
            维
          </button>
          <button
            type="button"
            class="prep-tag mea"
            :class="{ 'is-active': isMeasure(col.name) }"
            title="设为度量"
            @click.stop="$emit('toggle-measure', data.source.id, col.id)"
            @mousedown.stop
          >
            度
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { DataPrepSchemaColumn, DataPrepSource } from '../types'
import { fieldKey } from '../factories'

defineOptions({
  name: 'DataPrepSourceTableNode',
})

const props = defineProps<{
  data: {
    source: DataPrepSource
    schemaName?: string
    columns: DataPrepSchemaColumn[]
    selected: boolean
    dimensionFields: Set<string>
    measureFields: Set<string>
  }
}>()

defineEmits<{
  select: [sourceId: string]
  remove: [sourceId: string]
  'select-column': [sourceId: string, columnId: string]
  'toggle-dimension': [sourceId: string, columnId: string]
  'toggle-measure': [sourceId: string, columnId: string]
}>()

const fieldOf = (columnName: string) => fieldKey(props.data.source.alias, columnName)
const isDimension = (columnName: string) => props.data.dimensionFields.has(fieldOf(columnName))
const isMeasure = (columnName: string) => props.data.measureFields.has(fieldOf(columnName))
</script>

<style scoped>
.prep-table-node {
  position: relative;
  min-width: 220px;
  max-width: 300px;
  border: 1px solid var(--layout-border-color, var(--border-color));
  border-radius: 8px;
  background: var(--component-background-color);
  box-shadow: var(--card-shadow);
  font-size: 11px;
  color: var(--text-color);
}

.prep-handle {
  width: 8px;
  height: 8px;
  border: 1px solid var(--layout-border-color, var(--border-color));
  background: var(--component-background-color);
}

.prep-table-node.is-selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
}

.prep-table-node__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--layout-border-color, var(--border-color));
  background: color-mix(in srgb, var(--primary-color) 8%, transparent);
}

.prep-table-node__left {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
}

.prep-table-node__title {
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prep-table-node__schema {
  flex-shrink: 0;
  max-width: 72px;
  overflow: hidden;
  padding: 0 4px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  color: var(--primary-color);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prep-table-node__alias {
  color: var(--text-secondary-color, var(--text-color-secondary));
  opacity: 0.85;
}

.prep-table-node__body {
  max-height: 280px;
  overflow: auto;
}

.prep-table-node__row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  cursor: pointer;
  border-bottom: 1px solid color-mix(in srgb, var(--layout-border-color) 55%, transparent);
}

.prep-table-node__row:hover {
  background: color-mix(in srgb, var(--primary-color) 6%, transparent);
}

.prep-table-node__row.is-dimension:not(.is-both) {
  background: color-mix(in srgb, #3b82f6 10%, transparent);
}

.prep-table-node__row.is-measure:not(.is-both) {
  background: color-mix(in srgb, #16a34a 10%, transparent);
}

.prep-table-node__row.is-both {
  background: color-mix(in srgb, #3b82f6 8%, color-mix(in srgb, #16a34a 8%, transparent));
}

.prep-table-node__col-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prep-table-node__col-type {
  color: var(--text-secondary-color, var(--text-color-secondary));
}

.prep-table-node__tags {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
}

.prep-tag {
  box-sizing: border-box;
  display: inline-flex;
  min-width: 20px;
  height: 18px;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 1px solid color-mix(in srgb, var(--layout-border-color, var(--border-color)) 80%, transparent);
  border-radius: 3px;
  background: color-mix(in srgb, var(--layout-background-color, #f5f5f5) 70%, transparent);
  color: var(--text-color-secondary, var(--text-secondary-color, #8c8c8c));
  font-size: 10px;
  line-height: 1;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.prep-tag:hover {
  color: var(--text-color);
  border-color: var(--layout-border-color, var(--border-color));
}

.prep-tag.dim.is-active {
  color: #1d4ed8;
  background: color-mix(in srgb, #3b82f6 22%, transparent);
  border-color: color-mix(in srgb, #3b82f6 45%, transparent);
  font-weight: 600;
}

.prep-tag.mea.is-active {
  color: #15803d;
  background: color-mix(in srgb, #16a34a 22%, transparent);
  border-color: color-mix(in srgb, #16a34a 45%, transparent);
  font-weight: 600;
}
</style>
