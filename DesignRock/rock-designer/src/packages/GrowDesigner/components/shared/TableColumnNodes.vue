<template>
  <TableColumnNode
    v-for="col in visibleColumns"
    :key="tableColumnRenderKey(col)"
    :column="col"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DesignerTableColumn } from '../../static/tableColumns'
import {
  coerceToDesignerTableColumns,
  filterVisibleTableColumns,
  tableColumnRenderKey,
} from '../../static/tableColumnUtils'
import TableColumnNode from './TableColumnNode.vue'

defineOptions({ name: 'TableColumnNodes' })

const props = withDefaults(
  defineProps<{
    /** 设计器列或 EP columns（绑定变量求值结果） */
    columns?: DesignerTableColumn[] | Record<string, any>[] | unknown
  }>(),
  {
    columns: () => [],
  },
)

const normalizedColumns = computed(() =>
  coerceToDesignerTableColumns(props.columns),
)

const visibleColumns = computed(() =>
  filterVisibleTableColumns(normalizedColumns.value),
)
</script>
