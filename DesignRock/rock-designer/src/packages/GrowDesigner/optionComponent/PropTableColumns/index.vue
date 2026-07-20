<template>
  <div class="prop-table-columns">
    <div class="prop-table-columns__summary">
      <span class="prop-table-columns__count">已配置 {{ columnCount }} 列</span>
      <GrowButton size="small" @click="visible = true">设置表头</GrowButton>
    </div>

    <TableColumnsDialog
      v-model:visible="visible"
      :model-value="columns"
      @confirm="onConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DesignerTableColumn } from '../../static/tableColumns'
import TableColumnsDialog from './TableColumnsDialog.vue'

defineOptions({ name: 'PropTableColumns' })

const props = withDefaults(
  defineProps<{
    modelValue?: DesignerTableColumn[]
  }>(),
  {
    modelValue: () => [],
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: DesignerTableColumn[]]
}>()

const visible = ref(false)

const columns = computed(() =>
  Array.isArray(props.modelValue) ? props.modelValue : [],
)

const countColumns = (list: DesignerTableColumn[]): number =>
  list.reduce((sum, col) => {
    const childCount = col.children?.length ? countColumns(col.children) : 0
    return sum + 1 + childCount
  }, 0)

const columnCount = computed(() => countColumns(columns.value))

const onConfirm = (next: DesignerTableColumn[]) => {
  emit('update:modelValue', next)
}
</script>

<style scoped lang="scss">
.prop-table-columns {
  width: 100%;
}

.prop-table-columns__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}

.prop-table-columns__count {
  font-size: 12px;
  color: var(--text-color-secondary, #909399);
}
</style>
