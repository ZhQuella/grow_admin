<template>
  <GrowDrawer
    :model-value="visible"
    title="数据预览"
    direction="btt"
    placement="bottom"
    size="50%"
    height="50%"
    :destroy-on-close="true"
    class="data-prep-preview-drawer"
    @update:model-value="onVisible"
  >
    <div class="box-border flex h-full min-h-0 flex-col px-3 py-2">
      <div v-if="error" class="py-6 text-center text-xs text-red-500">{{ error }}</div>
      <div v-else-if="loading" class="py-6 text-center text-xs text-text-secondary">加载中…</div>
      <GrowTable
        v-else-if="tableColumns.length"
        :data="tableData"
        border
        size="small"
        height="100%"
        class="prep-preview-table h-full min-h-0 flex-1"
      >
        <GrowTableColumn
          v-for="col in tableColumns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          min-width="120"
          show-overflow-tooltip
        />
      </GrowTable>
      <div v-else class="py-6 text-center text-xs text-text-secondary">
        暂无数据，请先配置维度或度量
      </div>
    </div>
  </GrowDrawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DatasetQueryResult } from '../../types'

defineOptions({
  name: 'DataPrepPreviewDrawer',
})

const props = defineProps<{
  visible: boolean
  loading?: boolean
  error?: string
  result?: DatasetQueryResult | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
}>()

const isPercentTitle = (title?: string) =>
  !!title &&
  (title.endsWith('(占比)') || title.endsWith('(同比)') || title.endsWith('(环比)'))

const formatCell = (value: unknown, title?: string) => {
  if (value == null) return '-'
  if (typeof value === 'number') {
    if (isPercentTitle(title)) {
      return `${(value * 100).toFixed(2)}%`
    }
    return Number.isInteger(value) ? String(value) : value.toFixed(2)
  }
  return String(value)
}

const tableColumns = computed(() =>
  (props.result?.columns || []).map((col) => ({
    prop: col.key,
    label: col.title,
  })),
)

const tableData = computed(() =>
  (props.result?.rows || []).map((row) => {
    const next: Record<string, string> = {}
    for (const col of props.result?.columns || []) {
      next[col.key] = formatCell(row[col.key], col.title)
    }
    return next
  }),
)

function onVisible(value: boolean) {
  emit('update:visible', value)
  if (!value) emit('close')
}
</script>

<style scoped>
.prep-preview-table {
  width: 100%;
}
</style>

<style>
/* Drawer 挂到 body，需非 scoped 才能锁住 body 高度 */
.data-prep-preview-drawer.el-drawer,
.data-prep-preview-drawer.n-drawer {
  display: flex;
  flex-direction: column;
}

.data-prep-preview-drawer .el-drawer__body,
.data-prep-preview-drawer .n-drawer-body-content-wrapper {
  flex: 1 1 auto;
  height: 0;
  min-height: 0;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
