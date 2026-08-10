<template>
  <div
    class="prep-table-node"
    :class="{ 'is-selected': data.selected, 'is-primary': data.isPrimary }"
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
        <span v-if="data.isPrimary" class="prep-table-node__primary-tag">主表</span>
        <span v-if="data.schemaName" class="prep-table-node__schema" :title="data.schemaName">
          {{ data.schemaName }}
        </span>
        <span class="prep-table-node__alias">as {{ data.source.alias }}</span>
      </div>
    </div>

    <div class="prep-table-node__body">
      <div
        v-for="col in data.columns"
        :key="col.id"
        class="prep-table-node__row"
        @click.stop="$emit('select-column', data.source.id, col.id)"
      >
        <span class="prep-table-node__col-name">{{ col.name }}</span>
        <span class="prep-table-node__col-type">{{ col.type }}</span>
      </div>
    </div>

    <div class="prep-table-node__footer" @click.stop @mousedown.stop>
      <GrowButton
        v-if="data.isPrimary"
        size="small"
        type="primary"
        class="prep-table-node__footer-btn"
        disabled
      >
        <GrowIconify icon="carbon:home" :size="12" class="mr-1 align-[-2px]" />
        当前主表
      </GrowButton>
      <GrowPopover
        v-else
        :visible="primaryConfirmVisible"
        trigger="click"
        placement="bottom"
        :width="280"
        @update:visible="onPrimaryConfirmVisible"
      >
        <template #reference>
          <GrowButton size="small" class="prep-table-node__footer-btn" @mousedown.stop>
            <GrowIconify icon="carbon:home" :size="12" class="mr-1 align-[-2px]" />
            设为主表
          </GrowButton>
        </template>
        <div class="prep-popconfirm" @click.stop @mousedown.stop>
          <div class="prep-popconfirm__title">变更主表</div>
          <div class="prep-popconfirm__content">
            当前主表为「{{ data.primaryLabel || '未命名' }}」，确认将主表变更为「{{
              data.source.tableName || data.source.alias
            }}」？
          </div>
          <div class="prep-popconfirm__actions">
            <GrowButton size="small" @click="primaryConfirmVisible = false">取消</GrowButton>
            <GrowButton size="small" type="primary" @click="confirmSetPrimary">确认变更</GrowButton>
          </div>
        </div>
      </GrowPopover>
      <GrowButton
        type="danger"
        size="small"
        class="prep-table-node__footer-btn"
        @click.stop="$emit('remove', data.source.id)"
        @mousedown.stop
      >
        <GrowIconify icon="carbon:trash-can" :size="12" class="mr-1 align-[-2px]" />
        删除
      </GrowButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { DataPrepSchemaColumn, DataPrepSource } from '../../model/types'

defineOptions({
  name: 'DataPrepSourceTableNode',
})

const props = defineProps<{
  data: {
    source: DataPrepSource
    schemaName?: string
    columns: DataPrepSchemaColumn[]
    selected: boolean
    isPrimary: boolean
    primaryLabel?: string
  }
}>()

const emit = defineEmits<{
  select: [sourceId: string]
  remove: [sourceId: string]
  'select-column': [sourceId: string, columnId: string]
  'set-primary': [sourceId: string]
}>()

const primaryConfirmVisible = ref(false)

function onPrimaryConfirmVisible(visible: boolean) {
  primaryConfirmVisible.value = visible
}

function confirmSetPrimary() {
  primaryConfirmVisible.value = false
  emit('set-primary', props.data.source.id)
}
</script>

<style scoped>
.prep-table-node {
  position: relative;
  min-width: 240px;
  max-width: 320px;
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

.prep-table-node.is-primary:not(.is-selected) {
  border-color: color-mix(in srgb, var(--primary-color) 55%, var(--layout-border-color, var(--border-color)));
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

.prep-table-node__primary-tag {
  flex-shrink: 0;
  padding: 0 5px;
  border-radius: 3px;
  background: var(--primary-color);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
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
  padding: 11px 10px;
  cursor: pointer;
  border-bottom: 1px solid color-mix(in srgb, var(--layout-border-color) 55%, transparent);
}

.prep-table-node__row:hover {
  background: color-mix(in srgb, var(--primary-color) 6%, transparent);
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

.prep-table-node__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  padding: 8px 10px;
  border-top: 1px solid var(--layout-border-color, var(--border-color));
  background: color-mix(in srgb, var(--layout-background-color, #f5f5f5) 65%, transparent);
}

.prep-table-node__footer-btn {
  margin: 0 !important;
}

.prep-popconfirm__title {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
}

.prep-popconfirm__content {
  margin-bottom: 12px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-secondary-color, var(--text-color-secondary));
}

.prep-popconfirm__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
