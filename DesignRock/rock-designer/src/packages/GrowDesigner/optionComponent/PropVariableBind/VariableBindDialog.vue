<template>
  <GrowDialog
    :model-value="visible"
    title="变量绑定"
    width="720px"
    append-to-body
    destroy-on-close
    class="variable-bind-dialog"
    @update:model-value="onVisibleChange"
  >
    <div class="variable-bind-dialog__body" @click.stop>
      <!-- 变量列表：仅搜索 + 列表，无左侧分类栏 -->
      <section class="variable-bind-dialog__list-pane">
        <h4 class="variable-bind-dialog__pane-title">变量列表</h4>
        <div class="variable-bind-dialog__search">
          <GrowInput
            v-model="keyword"
            size="small"
            clearable
            placeholder="请输入"
          />
          <GrowIconify
            class="variable-bind-dialog__search-icon"
            icon="carbon:search"
            :size="14"
          />
        </div>
        <GrowScrollbar class="variable-bind-dialog__scroll">
          <div v-if="listEmpty" class="variable-bind-dialog__empty">
            暂无变量，请先在左侧「数据源」中添加数据源或计算属性
          </div>
          <div v-else-if="!filteredVariables.length" class="variable-bind-dialog__empty">
            暂无匹配变量
          </div>
          <button
            v-for="item in filteredVariables"
            :key="item.key"
            type="button"
            class="variable-bind-dialog__item"
            :class="{ 'is-active': draft === item.expression }"
            :title="item.expression"
            @click="onPickVariable(item.expression)"
          >
            <span class="variable-bind-dialog__item-name">{{ item.label }}</span>
            <span class="variable-bind-dialog__item-expr">{{ item.expression }}</span>
            <span v-if="item.describe" class="variable-bind-dialog__item-desc">
              {{ item.describe }}
            </span>
          </button>
        </GrowScrollbar>
      </section>

      <!-- 变量编辑：与数据源一致，使用 GrowCodeEditor -->
      <section class="variable-bind-dialog__editor-pane">
        <h4 class="variable-bind-dialog__pane-title">变量</h4>
        <p class="variable-bind-dialog__editor-tip">
          写法与 JS 函数体一致，可使用
          <code>state</code>
          ，须
          <code>return</code>
          返回绑定值。
        </p>
        <div class="variable-bind-dialog__editor">
          <GrowCodeEditor
            v-model="draft"
            class="h-full"
            default-language="javascript"
            :language-switchable="false"
          />
        </div>
        <div class="variable-bind-dialog__example">
          <p class="variable-bind-dialog__example-title">示例</p>
          <pre class="variable-bind-dialog__example-code">{{ BIND_EXAMPLE_CODE }}</pre>
        </div>
      </section>
    </div>

    <template #footer>
      <div class="variable-bind-dialog__footer">
        <GrowButton type="warning" plain @click="onRemove">移除绑定</GrowButton>
        <div class="variable-bind-dialog__footer-right">
          <GrowButton @click="onCancel">取消</GrowButton>
          <GrowButton type="primary" @click="onConfirm">确定</GrowButton>
        </div>
      </div>
    </template>
  </GrowDialog>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { GrowCodeEditor } from '@grow-admin-rock/code-sandbox'
import { ACTIVE_UUID, DRAGGABLE_CONGIG } from '../../config/designation'
import type { DesignerDataSourceItem } from '../../components/dataSource/types'
import { collectAncestorLoopScopes } from '../../static/loopScope'
import { BIND_EXAMPLE_CODE } from './constants'
import { insertVariableExpression, useVariableList } from './use/useVariableList'

defineOptions({ name: 'VariableBindDialog' })

const props = defineProps<{
  visible: boolean
  modelValue?: string
  /** 当前是否已是绑定态；非绑定打开时不带入普通文本 */
  bound?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [value: string]
  remove: []
}>()

const draggableConfig = inject(DRAGGABLE_CONGIG, null) as Record<string, any> | null
const activeUUID = inject(ACTIVE_UUID, null) as { value?: string } | null

/** 变量列表数据来自设计器「数据源」 */
const sourceList = computed<DesignerDataSourceItem[]>(() => {
  const list = draggableConfig?.dataSource
  return Array.isArray(list) ? list : []
})

const computedList = computed(() => {
  const list = draggableConfig?.computedProps
  return Array.isArray(list) ? list : []
})

/** 当前选中节点所在的循环作用域（支持嵌套） */
const loopScopes = computed(() =>
  collectAncestorLoopScopes(
    draggableConfig?.structures,
    activeUUID?.value,
    draggableConfig?.renderArgument,
    draggableConfig?.props,
  ),
)

const keyword = ref('')
const draft = ref('')

const { filteredVariables } = useVariableList(
  sourceList,
  keyword,
  loopScopes,
  computedList,
)

const listEmpty = computed(
  () =>
    !sourceList.value.length &&
    !computedList.value.length &&
    !loopScopes.value.length,
)

watch(
  () => props.visible,
  async (open) => {
    if (!open) return
    // 已绑定：带回表达式；用 String 避免 || 把合法值吃掉
    const raw = props.modelValue == null ? '' : String(props.modelValue)
    draft.value = props.bound ? raw : ''
    keyword.value = ''
    // 等编辑器挂载后再写一次，避免再次打开时内容被空值覆盖
    await Promise.resolve()
    if (props.visible && props.bound) {
      draft.value = props.modelValue == null ? '' : String(props.modelValue)
    }
  },
)

const onVisibleChange = (open: boolean) => {
  emit('update:visible', open)
}

const onPickVariable = (expression: string) => {
  draft.value = insertVariableExpression(draft.value, expression)
}

const onCancel = () => emit('update:visible', false)

const onConfirm = () => {
  emit('confirm', draft.value)
  emit('update:visible', false)
}

const onRemove = () => {
  draft.value = ''
  emit('remove')
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.variable-bind-dialog__body {
  display: grid;
  grid-template-columns: minmax(180px, 28%) 1fr;
  gap: 0;
  height: min(420px, calc(100vh - 220px));
  min-height: 320px;
  overflow: hidden;
  margin: -4px -4px 0;
}

.variable-bind-dialog__list-pane,
.variable-bind-dialog__editor-pane {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 4px 12px 0;
}

.variable-bind-dialog__list-pane {
  border-right: 1px solid var(--layout-border-color, #ebeef5);
  padding-left: 0;
  padding-right: 12px;
}

.variable-bind-dialog__editor-pane {
  padding-right: 0;
}

.variable-bind-dialog__editor-tip {
  margin: 0 0 8px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-color-secondary, #909399);
}

.variable-bind-dialog__editor {
  position: relative;
  flex: 1;
  min-height: 160px;
  overflow: hidden;
  border: 1px solid var(--layout-border-color, #ebeef5);
  border-radius: 4px;
}

.variable-bind-dialog__example {
  flex-shrink: 0;
  margin-top: 8px;
  max-height: 120px;
  overflow: auto;
}

.variable-bind-dialog__example-title {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-color, #303133);
}

.variable-bind-dialog__example-code {
  margin: 0;
  font-size: 11px;
  line-height: 1.45;
  color: var(--text-color-secondary, #909399);
  white-space: pre-wrap;
  font-family: inherit;
}

.variable-bind-dialog__pane-title {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color, #303133);
}

.variable-bind-dialog__search {
  position: relative;
  margin-bottom: 10px;

  :deep(.el-input__wrapper),
  :deep(.n-input) {
    padding-right: 28px;
  }
}

.variable-bind-dialog__search-icon {
  position: absolute;
  top: 50%;
  right: 10px;
  color: var(--text-color-secondary, #909399);
  transform: translateY(-50%);
  pointer-events: none;
}

.variable-bind-dialog__scroll {
  flex: 1;
  min-height: 180px;
}

.variable-bind-dialog__empty {
  padding: 24px 8px;
  text-align: center;
  font-size: 12px;
  color: var(--text-color-secondary, #909399);
}

.variable-bind-dialog__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  margin: 0 0 4px;
  padding: 8px 10px;
  border: none;
  border-radius: 4px;
  background: transparent;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: var(--layout-container-background-color, #f0f2f5);
  }

  &.is-active {
    background: var(--color-primary-a08, rgba(139, 92, 246, 0.08));
  }
}

.variable-bind-dialog__item-name {
  font-size: 13px;
  color: var(--text-color, #303133);
}

.variable-bind-dialog__item-expr {
  font-size: 12px;
  color: var(--text-color-secondary, #909399);
}

.variable-bind-dialog__item-desc {
  font-size: 11px;
  line-height: 1.4;
  color: var(--text-color-secondary, #a8abb2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.variable-bind-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.variable-bind-dialog__footer-right {
  display: inline-flex;
  gap: 8px;
}
</style>
