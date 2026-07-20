<template>
  <div
    class="column-tree-node"
    :class="{ 'column-tree-node--active': editing }"
    :style="{ paddingLeft: `${depth * 12}px` }"
  >
    <div class="column-tree-node__row">
      <span class="column-tree-node__drag" title="拖拽排序">
        <GrowIconify icon="carbon:draggable" :size="14" />
      </span>
      <button
        type="button"
        class="column-tree-node__toggle"
        :title="expanded ? '收起' : '展开'"
        @click="expanded = !expanded"
      >
        <GrowIconify
          :icon="expanded ? 'carbon:chevron-down' : 'carbon:chevron-right'"
          :size="14"
        />
      </button>
      <span class="column-tree-node__title" :title="column.title">
        {{ column.title || '未命名' }}
      </span>
      <span class="column-tree-node__field">{{ column.field || (hasChildren ? '分组' : '-') }}</span>
      <button
        type="button"
        class="column-tree-node__btn"
        title="添加子列"
        @click="emit('add-child', column.id)"
      >
        <GrowIconify icon="carbon:add" :size="14" />
      </button>
      <button
        type="button"
        class="column-tree-node__btn"
        :class="{ 'column-tree-node__btn--active': editing }"
        :title="editing ? '取消' : '编辑'"
        @click="editing = !editing"
      >
        <GrowIconify :icon="editing ? 'carbon:close' : 'carbon:edit'" :size="14" />
      </button>
      <button
        type="button"
        class="column-tree-node__btn column-tree-node__btn--danger"
        title="删除"
        @click="emit('remove', column.id)"
      >
        <GrowIconify icon="carbon:trash-can" :size="14" />
      </button>
    </div>

    <ColumnEditForm
      v-if="editing"
      class="column-tree-node__edit"
      :model-value="column"
      :depth="depth"
      @update:model-value="(next) => emit('update', next)"
    />

    <draggable
      v-if="hasChildren && expanded"
      class="column-tree-node__children"
      :model-value="column.children || []"
      item-key="id"
      group="designer-table-columns"
      handle=".column-tree-node__drag"
      :animation="200"
      @update:model-value="onChildrenChange"
    >
      <template #item="{ element }">
        <ColumnTreeNode
          :column="element"
          :depth="depth + 1"
          @update="(col) => emit('update', col)"
          @remove="(id) => emit('remove', id)"
          @add-child="(id) => emit('add-child', id)"
          @replace-children="(payload) => emit('replace-children', payload)"
        />
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import draggable from 'vuedraggable'
import type { DesignerTableColumn } from '../../static/tableColumns'
import ColumnEditForm from './ColumnEditForm.vue'

defineOptions({ name: 'ColumnTreeNode' })

const props = defineProps<{
  column: DesignerTableColumn
  depth?: number
}>()

const emit = defineEmits<{
  update: [column: DesignerTableColumn]
  remove: [id: string]
  'add-child': [parentId: string]
  'replace-children': [payload: { parentId: string; children: DesignerTableColumn[] }]
}>()

const depth = computed(() => props.depth ?? 0)
const hasChildren = computed(() => Boolean(props.column.children?.length))
const expanded = ref(true)
const editing = ref(false)

const onChildrenChange = (children: DesignerTableColumn[]) => {
  emit('replace-children', { parentId: props.column.id, children })
}
</script>

<style scoped lang="scss">
.column-tree-node {
  box-sizing: border-box;
  border-radius: 4px;
  transition: background 0.15s ease;

  &--active {
    background: var(--el-color-primary-light-9, #ecf5ff);
  }
}

.column-tree-node__row {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 32px;
  padding: 2px 4px;
}

.column-tree-node__drag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: var(--text-color-secondary, #909399);
  cursor: grab;
  line-height: 0;
}

.column-tree-node__toggle,
.column-tree-node__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-color-secondary, #909399);
  cursor: pointer;
  line-height: 0;

  &:hover {
    background: #eef0f3;
    color: var(--text-color, #303133);
  }
}

.column-tree-node__drag,
.column-tree-node__toggle,
.column-tree-node__btn {
  :deep(.grow-iconify),
  :deep(svg) {
    display: block;
    margin: auto;
    line-height: 0;
  }
}

.column-tree-node__btn--active {
  background: var(--el-color-primary-light-8, #d9ecff);
  color: var(--primary-color, #409eff);
}

.column-tree-node__btn--danger:hover {
  background: #fef0f0;
  color: #f56c6c;
}

.column-tree-node--active .column-tree-node__title {
  color: var(--primary-color, #409eff);
  font-weight: 500;
}

.column-tree-node__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--text-color, #303133);
}

.column-tree-node__field {
  flex: 0 0 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  color: var(--text-color-secondary, #909399);
}

.column-tree-node__edit {
  margin: 4px 0 8px;
}

.column-tree-node__children {
  margin-left: 4px;
  border-left: 1px dashed var(--layout-border-color, #ebeef5);
}
</style>
