<template>
  <!-- 叶子列：不能有 default 插槽，否则 EP 不会用 prop 渲染单元格文字 -->
  <GrowTableColumn v-if="!childColumns.length" v-bind="bindProps" />
  <GrowTableColumn v-else v-bind="bindProps">
    <TableColumnNode
      v-for="child in childColumns"
      :key="tableColumnRenderKey(child)"
      :column="child"
    />
  </GrowTableColumn>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DesignerTableColumn } from '../../static/tableColumns'
import {
  filterVisibleTableColumns,
  tableColumnRenderKey,
  toTableColumnBindProps,
} from '../../static/tableColumnUtils'
import TableColumnNode from './TableColumnNode.vue'

defineOptions({ name: 'TableColumnNode' })

const props = defineProps<{
  column: DesignerTableColumn
}>()

const childColumns = computed(() =>
  props.column.children?.length
    ? filterVisibleTableColumns(props.column.children)
    : [],
)

const bindProps = computed(() => toTableColumnBindProps(props.column))
</script>
