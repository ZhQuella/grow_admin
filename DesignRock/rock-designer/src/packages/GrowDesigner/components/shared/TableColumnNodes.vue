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
  filterVisibleTableColumns,
  tableColumnRenderKey,
} from '../../static/tableColumnUtils'
import TableColumnNode from './TableColumnNode.vue'

defineOptions({ name: 'TableColumnNodes' })

const props = withDefaults(
  defineProps<{
    columns?: DesignerTableColumn[]
  }>(),
  {
    columns: () => [],
  },
)

const visibleColumns = computed(() =>
  filterVisibleTableColumns(props.columns || []),
)
</script>
