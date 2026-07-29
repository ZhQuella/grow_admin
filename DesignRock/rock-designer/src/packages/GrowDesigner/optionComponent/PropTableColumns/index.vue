<template>
  <div class="prop-table-columns">
    <div class="prop-table-columns__summary">
      <GrowBadge
        class="prop-table-columns__badge"
        :value="columnCount"
        :hidden="isBound || columnCount <= 0"
      >
        <GrowButton
          :type="isBound ? 'default' : 'primary'"
          size="small"
          :disabled="isBound"
          @click="visible = true"
        >
          设置表头
        </GrowButton>
      </GrowBadge>

      <GrowButton
        class="prop-table-columns__bind"
        size="small"
        :type="isBound ? 'primary' : 'default'"
        :title="isBound ? '已绑定，点击编辑表达式' : '绑定变量 / 表达式计算'"
        @click="dialogVisible = true"
      >
        <GrowIconify icon="carbon:function" :size="14" />
      </GrowButton>
    </div>

    <TableColumnsDialog
      v-model:visible="visible"
      :model-value="manualColumns"
      @confirm="onConfirm"
    />

    <VariableBindDialog
      v-model:visible="dialogVisible"
      :model-value="expressionText"
      :bound="isBound"
      @confirm="onBindConfirm"
      @remove="onBindRemove"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DesignerTableColumn } from '../../static/tableColumns'
import { createDefaultTableColumns } from '../../static/tableColumnUtils'
import {
  normalizePropBindMode,
  PROP_BIND_MODE_BIND,
  PROP_BIND_MODE_TEXT,
  type PropBindMode,
} from '../../static/propBindModes'
import TableColumnsDialog from './TableColumnsDialog.vue'
import VariableBindDialog from '../PropVariableBind/VariableBindDialog.vue'

defineOptions({ name: 'PropTableColumns' })

const props = withDefaults(
  defineProps<{
    /** 手动配置为列数组；绑定模式下为表达式字符串 */
    modelValue?: DesignerTableColumn[] | string | null
    bindMode?: PropBindMode | string
  }>(),
  {
    modelValue: () => [],
    bindMode: PROP_BIND_MODE_TEXT,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: DesignerTableColumn[] | string]
  'update:bindMode': [value: PropBindMode]
}>()

const visible = ref(false)
const dialogVisible = ref(false)

const isBound = computed(
  () => normalizePropBindMode(props.bindMode) === PROP_BIND_MODE_BIND,
)

const expressionText = computed(() => {
  if (!isBound.value) return ''
  if (props.modelValue == null) return ''
  return String(props.modelValue)
})

const manualColumns = computed<DesignerTableColumn[]>(() => {
  if (isBound.value) return []
  return Array.isArray(props.modelValue) ? props.modelValue : []
})

const countColumns = (list: DesignerTableColumn[]): number =>
  list.reduce((sum, col) => {
    const childCount = col.children?.length ? countColumns(col.children) : 0
    return sum + 1 + childCount
  }, 0)

const columnCount = computed(() => countColumns(manualColumns.value))

const onConfirm = (next: DesignerTableColumn[]) => {
  if (isBound.value) return
  emit('update:bindMode', PROP_BIND_MODE_TEXT)
  emit('update:modelValue', next)
}

const onBindConfirm = (value: string) => {
  const next = value == null ? '' : String(value)
  if (!next.trim()) {
    emit('update:bindMode', PROP_BIND_MODE_TEXT)
    emit('update:modelValue', createDefaultTableColumns())
    return
  }
  emit('update:modelValue', next)
  emit('update:bindMode', PROP_BIND_MODE_BIND)
}

const onBindRemove = () => {
  emit('update:bindMode', PROP_BIND_MODE_TEXT)
  emit('update:modelValue', createDefaultTableColumns())
}
</script>

<style scoped lang="scss">
.prop-table-columns {
  width: 100%;
}

.prop-table-columns__summary {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  width: 100%;
}

.prop-table-columns__badge {
  flex-shrink: 0;
  line-height: 1;
}

.prop-table-columns__bind {
  flex-shrink: 0;
  padding: 0 8px;

  :deep(.grow-iconify),
  :deep(svg) {
    display: block;
    margin: auto;
    line-height: 0;
  }
}
</style>
