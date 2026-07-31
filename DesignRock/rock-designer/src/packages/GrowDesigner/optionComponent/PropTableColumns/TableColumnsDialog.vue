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
          <div class="table-columns-dialog__toolbar">
            <button
              type="button"
              class="table-columns-dialog__tool-btn"
              :class="{ 'is-disabled': hasSelection }"
              :disabled="hasSelection"
              :title="hasSelection ? '已存在勾选列' : '添加勾选列'"
              @click="onAddSelection"
            >
              <GrowIconify icon="carbon:checkbox-checked" :size="14" />
              <span>添加勾选列</span>
            </button>
            <button
              type="button"
              class="table-columns-dialog__tool-btn"
              :class="{ 'is-disabled': hasIndex }"
              :disabled="hasIndex"
              :title="hasIndex ? '已存在序号列' : '添加序号列'"
              @click="onAddIndex"
            >
              <GrowIconify icon="carbon:list-numbered" :size="14" />
              <span>添加序号列</span>
            </button>
            <button
              type="button"
              class="table-columns-dialog__tool-btn is-primary"
              title="添加普通列"
              @click="onAddRoot"
            >
              <GrowIconify icon="carbon:add" :size="14" />
              <span>添加列</span>
            </button>
          </div>

          <GrowScrollbar height="100%" class="table-columns-dialog__scroll">
            <draggable
              :key="listKey"
              class="table-columns-dialog__tree"
              :list="draft"
              item-key="id"
              group="designer-table-columns"
              handle=".column-tree-node__drag"
              :animation="200"
              @change="onDragChange"
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
          </GrowScrollbar>
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
import { computed, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { deepCloneDesigner } from '@grow-admin-rock/utils'
import type { DesignerTableColumn } from '../../static/tableColumns'
import {
  appendTableColumn,
  createIndexColumn,
  createSelectionColumn,
  createTableColumn,
  hasSpecialColumn,
  insertSpecialColumn,
  normalizeSpecialColumns,
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

/** 使用可变数组 + :list，避免 model-value 回写冲掉程序化新增 */
const draft = ref<DesignerTableColumn[]>([])
const listKey = ref(0)

/** Vue Proxy 无法用 structuredClone，改用设计器深拷贝 */
const cloneColumns = (list: DesignerTableColumn[] = []) =>
  deepCloneDesigner(Array.isArray(list) ? list : []) as DesignerTableColumn[]

const hasSelection = computed(() => hasSpecialColumn(draft.value, 'selection'))
const hasIndex = computed(() => hasSpecialColumn(draft.value, 'index'))

const replaceDraft = (next: DesignerTableColumn[], remount = false) => {
  draft.value = normalizeSpecialColumns(next)
  if (remount) listKey.value += 1
}

watch(
  () => props.visible,
  (open) => {
    if (!open) return
    replaceDraft(cloneColumns(props.modelValue), true)
  },
)

/** 拖拽结束后再规范化（把误拖入分组的特殊列提回根级） */
const onDragChange = () => {
  replaceDraft([...draft.value], true)
}

const onUpdateColumn = (column: DesignerTableColumn) => {
  replaceDraft(updateTableColumnById(draft.value, column.id, column))
}

const onRemove = (id: string) => {
  replaceDraft(removeTableColumnById(draft.value, id), true)
}

const onAddRoot = () => {
  const index = draft.value.length + 1
  replaceDraft(
    [
      ...draft.value,
      createTableColumn({ title: `列 ${index}`, field: `field${index}` }),
    ],
    true,
  )
}

const onAddSelection = () => {
  if (hasSpecialColumn(draft.value, 'selection')) return
  replaceDraft(insertSpecialColumn(draft.value, createSelectionColumn()), true)
}

const onAddIndex = () => {
  if (hasSpecialColumn(draft.value, 'index')) return
  replaceDraft(insertSpecialColumn(draft.value, createIndexColumn()), true)
}

const onAddChild = (parentId: string) => {
  replaceDraft(
    appendTableColumn(
      draft.value,
      parentId,
      createTableColumn({ title: '子列', field: '' }),
    ),
    true,
  )
}

const onReplaceChildren = (payload: {
  parentId: string
  children: DesignerTableColumn[]
}) => {
  replaceDraft(
    replaceChildrenById(draft.value, payload.parentId, payload.children),
    true,
  )
}

const onCancel = () => emit('update:visible', false)

const onConfirm = () => {
  emit('confirm', normalizeSpecialColumns(cloneColumns(draft.value)))
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
  background: var(--component-background-color);
  box-shadow: var(--card-shadow);
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
    background: var(--header-action-hover-bg-color);
    color: var(--text-color, #303133);
  }
}

.table-columns-dialog__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 280px;
  overflow: hidden;
}

.table-columns-dialog__toolbar {
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  flex-shrink: 0;
  gap: 8px;
  padding: 10px 16px;
  background: var(--layout-container-background-color);
  border-bottom: 1px solid var(--layout-border-color, #ebeef5);
}

/* 锁死视口高度，滚动只发生在 GrowScrollbar 内部 wrap */
.table-columns-dialog__scroll {
  flex: 1 1 auto;
  width: 100%;
  height: 0;
  min-height: 0;
}

.table-columns-dialog__scroll :deep(.el-scrollbar__wrap),
.table-columns-dialog__scroll :deep(.n-scrollbar-container) {
  max-height: 100%;
}

.table-columns-dialog__tool-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 28px;
  margin: 0;
  padding: 0 10px;
  border: 1px solid var(--layout-border-color, #dcdfe6);
  border-radius: 4px;
  background: var(--component-background-color);
  color: var(--text-color, #303133);
  font-size: 12px;
  cursor: pointer;
  line-height: 1;

  :deep(.grow-iconify),
  :deep(svg) {
    display: block;
    line-height: 0;
  }

  &:hover:not(:disabled) {
    border-color: var(--primary-color, #409eff);
    color: var(--primary-color, #409eff);
  }

  &.is-primary {
    border-color: var(--primary-color, #409eff);
    color: var(--primary-color, #409eff);
    background: var(--color-primary-a08);
  }

  &:disabled,
  &.is-disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.table-columns-dialog__tree {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 16px;
}

.table-columns-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--layout-border-color, #ebeef5);
}
</style>
