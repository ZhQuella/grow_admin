<template>
  <Teleport to="body">
    <div v-if="visible" class="table-columns-dialog" @click.stop>
      <div class="table-columns-dialog__mask" @click="onCancel" />
      <div class="table-columns-dialog__panel" role="dialog" aria-modal="true">
        <header class="table-columns-dialog__header">
          <h3 class="table-columns-dialog__title">表头配置</h3>
          <button
            type="button"
            class="table-columns-dialog__close"
            title="关闭"
            @click="onCancel"
          >
            <GrowIconify icon="carbon:close" :size="16" />
          </button>
        </header>

        <div class="table-columns-dialog__body">
          <draggable
            class="table-columns-dialog__tree"
            :model-value="draft"
            item-key="id"
            group="designer-table-columns"
            handle=".column-tree-node__drag"
            :animation="200"
            @update:model-value="onRootChange"
          >
            <template #item="{ element }">
              <ColumnTreeNode
                :column="element"
                :depth="0"
                @update="onUpdateColumn"
                @remove="onRemove"
                @add-child="onAddChild"
                @replace-children="onReplaceChildren"
              />
            </template>
          </draggable>

          <button type="button" class="table-columns-dialog__add" @click="onAddRoot">
            <GrowIconify icon="carbon:add" :size="14" />
            <span>添加列</span>
          </button>
        </div>

        <footer class="table-columns-dialog__footer">
          <GrowButton @click="onCancel">取消</GrowButton>
          <GrowButton type="primary" @click="onConfirm">确定</GrowButton>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { deepCloneDesigner } from '@grow-admin-rock/utils'
import type { DesignerTableColumn } from '../../static/tableColumns'
import {
  appendTableColumn,
  createTableColumn,
  removeTableColumnById,
  replaceChildrenById,
  updateTableColumnById,
} from '../../static/tableColumnUtils'
import ColumnTreeNode from './ColumnTreeNode.vue'

defineOptions({ name: 'TableColumnsDialog' })

const props = defineProps<{
  visible: boolean
  modelValue?: DesignerTableColumn[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [value: DesignerTableColumn[]]
}>()

const draft = ref<DesignerTableColumn[]>([])

/** Vue Proxy 无法用 structuredClone，改用设计器深拷贝 */
const cloneColumns = (list: DesignerTableColumn[] = []) =>
  deepCloneDesigner(Array.isArray(list) ? list : []) as DesignerTableColumn[]

watch(
  () => props.visible,
  (open) => {
    if (!open) return
    draft.value = cloneColumns(props.modelValue)
  },
)

const onRootChange = (next: DesignerTableColumn[]) => {
  draft.value = next
}

const onUpdateColumn = (column: DesignerTableColumn) => {
  draft.value = updateTableColumnById(draft.value, column.id, column)
}

const onRemove = (id: string) => {
  draft.value = removeTableColumnById(draft.value, id)
}

const onAddRoot = () => {
  const index = draft.value.length + 1
  draft.value = [
    ...draft.value,
    createTableColumn({ title: `列 ${index}`, field: `field${index}` }),
  ]
}

const onAddChild = (parentId: string) => {
  draft.value = appendTableColumn(
    draft.value,
    parentId,
    createTableColumn({ title: '子列', field: '' }),
  )
}

const onReplaceChildren = (payload: {
  parentId: string
  children: DesignerTableColumn[]
}) => {
  draft.value = replaceChildrenById(
    draft.value,
    payload.parentId,
    payload.children,
  )
}

const onCancel = () => emit('update:visible', false)

const onConfirm = () => {
  emit('confirm', cloneColumns(draft.value))
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.table-columns-dialog {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-columns-dialog__mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
}

.table-columns-dialog__panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: min(720px, calc(100vw - 48px));
  max-height: min(640px, calc(100vh - 48px));
  overflow: hidden;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
}

.table-columns-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--layout-border-color, #ebeef5);
}

.table-columns-dialog__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color, #303133);
}

.table-columns-dialog__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-color-secondary, #909399);
  cursor: pointer;
  line-height: 0;

  :deep(.grow-iconify),
  :deep(svg) {
    display: block;
    margin: auto;
    line-height: 0;
  }

  &:hover {
    background: #f2f3f5;
    color: var(--text-color, #303133);
  }
}

.table-columns-dialog__body {
  flex: 1;
  min-height: 280px;
  overflow: auto;
  padding: 12px 16px;
}

.table-columns-dialog__tree {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
}

.table-columns-dialog__add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 32px;
  margin: 0;
  padding: 0 8px;
  border: 1px dashed var(--layout-border-color, #dcdfe6);
  border-radius: 4px;
  background: transparent;
  color: var(--text-color-secondary, #909399);
  font-size: 12px;
  cursor: pointer;
  line-height: 1;

  :deep(.grow-iconify),
  :deep(svg) {
    display: block;
    margin: auto 0;
    line-height: 0;
  }

  &:hover {
    border-color: var(--primary-color, #409eff);
    color: var(--primary-color, #409eff);
  }
}

.table-columns-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--layout-border-color, #ebeef5);
}
</style>
