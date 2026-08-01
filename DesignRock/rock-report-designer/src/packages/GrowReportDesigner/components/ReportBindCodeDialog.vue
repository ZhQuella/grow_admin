<template>
  <GrowDialog
    :model-value="visible"
    title="变量绑定"
    width="720px"
    append-to-body
    destroy-on-close
    class="report-bind-code-dialog"
    @update:model-value="onVisibleChange"
  >
    <div class="report-bind-code-dialog__body" @click.stop>
      <section class="report-bind-code-dialog__list-pane">
        <h4 class="report-bind-code-dialog__pane-title">变量列表</h4>
        <div class="report-bind-code-dialog__search">
          <GrowInput v-model="keyword" size="small" clearable placeholder="请输入" />
          <GrowIconify
            class="report-bind-code-dialog__search-icon"
            icon="carbon:search"
            :size="14"
          />
        </div>
        <GrowScrollbar class="report-bind-code-dialog__scroll">
          <div v-if="!variables.length" class="report-bind-code-dialog__empty">
            暂无变量，请先在左侧配置数据源 / 数据请求 / 计算属性
          </div>
          <div v-else-if="!filteredVariables.length" class="report-bind-code-dialog__empty">
            暂无匹配变量
          </div>
          <button
            v-for="item in filteredVariables"
            :key="item.value"
            type="button"
            class="report-bind-code-dialog__item"
            :class="{ 'is-active': draft.includes(item.value) }"
            :title="item.value"
            @click="onPickVariable(item.value)"
          >
            <span class="report-bind-code-dialog__item-name">{{ item.label }}</span>
            <span class="report-bind-code-dialog__item-expr">{{ item.value }}</span>
          </button>
        </GrowScrollbar>
      </section>

      <section class="report-bind-code-dialog__editor-pane">
        <h4 class="report-bind-code-dialog__pane-title">变量</h4>
        <p class="report-bind-code-dialog__editor-tip">
          写法与 JS 函数体一致，可使用
          <code>state</code>
          ，须
          <code>return</code>
          返回绑定值。
        </p>
        <div class="report-bind-code-dialog__editor">
          <GrowCodeEditor
            v-model="draft"
            class="h-full"
            default-language="javascript"
            :language-switchable="false"
          />
        </div>
        <div class="report-bind-code-dialog__example">
          <p class="report-bind-code-dialog__example-title">示例</p>
          <pre class="report-bind-code-dialog__example-code">{{ EXAMPLE_CODE }}</pre>
        </div>
      </section>
    </div>

    <template #footer>
      <div class="report-bind-code-dialog__footer">
        <GrowButton type="warning" plain @click="onRemove">移除绑定</GrowButton>
        <div class="report-bind-code-dialog__footer-right">
          <GrowButton @click="onCancel">取消</GrowButton>
          <GrowButton type="primary" @click="onConfirm">确定</GrowButton>
        </div>
      </div>
    </template>
  </GrowDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { GrowCodeEditor } from '@grow-admin-rock/code-sandbox'

defineOptions({
  name: 'ReportBindCodeDialog',
})

const EXAMPLE_CODE = `// 直接绑定
return state.xxx

// 多行计算
const list = state.list || []
return list.map((item) => item.value)`

const props = defineProps<{
  visible: boolean
  modelValue?: string
  /** 已是代码绑定时打开带回原内容 */
  bound?: boolean
  variables?: Array<{ label: string; value: string }>
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [value: string]
  remove: []
}>()

const keyword = ref('')
const draft = ref('')

const variables = computed(() => props.variables || [])

const filteredVariables = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return variables.value
  return variables.value.filter(
    (item) =>
      item.label.toLowerCase().includes(kw) || item.value.toLowerCase().includes(kw),
  )
})

watch(
  () => props.visible,
  async (open) => {
    if (!open) return
    const raw = props.modelValue == null ? '' : String(props.modelValue)
    draft.value = props.bound ? raw : ''
    keyword.value = ''
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
  const expr = String(expression || '').trim()
  if (!expr) return
  const trimmed = draft.value.trim()
  draft.value = trimmed ? `${trimmed}${expr}` : `return ${expr}`
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
.report-bind-code-dialog__body {
  display: grid;
  grid-template-columns: minmax(180px, 28%) 1fr;
  gap: 0;
  height: min(420px, calc(100vh - 220px));
  min-height: 320px;
  overflow: hidden;
  margin: -4px -4px 0;
}

.report-bind-code-dialog__list-pane,
.report-bind-code-dialog__editor-pane {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 4px 12px 0;
}

.report-bind-code-dialog__list-pane {
  border-right: 1px solid var(--layout-border-color, #ebeef5);
  padding-left: 0;
  padding-right: 12px;
}

.report-bind-code-dialog__editor-pane {
  padding-right: 0;
}

.report-bind-code-dialog__editor-tip {
  margin: 0 0 8px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-color-secondary, #909399);
}

.report-bind-code-dialog__editor {
  position: relative;
  flex: 1;
  min-height: 160px;
  overflow: hidden;
  border: 1px solid var(--layout-border-color, #ebeef5);
  border-radius: 4px;
}

.report-bind-code-dialog__example {
  flex-shrink: 0;
  margin-top: 8px;
  max-height: 120px;
  overflow: auto;
}

.report-bind-code-dialog__example-title {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-color, #303133);
}

.report-bind-code-dialog__example-code {
  margin: 0;
  font-size: 11px;
  line-height: 1.45;
  color: var(--text-color-secondary, #909399);
  white-space: pre-wrap;
  font-family: inherit;
}

.report-bind-code-dialog__pane-title {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color, #303133);
}

.report-bind-code-dialog__search {
  position: relative;
  margin-bottom: 10px;

  :deep(.el-input__wrapper),
  :deep(.n-input) {
    padding-right: 28px;
  }
}

.report-bind-code-dialog__search-icon {
  position: absolute;
  top: 50%;
  right: 10px;
  color: var(--text-color-secondary, #909399);
  transform: translateY(-50%);
  pointer-events: none;
}

.report-bind-code-dialog__scroll {
  flex: 1;
  min-height: 180px;
}

.report-bind-code-dialog__empty {
  padding: 24px 8px;
  text-align: center;
  font-size: 12px;
  color: var(--text-color-secondary, #909399);
}

.report-bind-code-dialog__item {
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

.report-bind-code-dialog__item-name {
  font-size: 13px;
  color: var(--text-color, #303133);
}

.report-bind-code-dialog__item-expr {
  font-size: 12px;
  color: var(--text-color-secondary, #909399);
}

.report-bind-code-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.report-bind-code-dialog__footer-right {
  display: inline-flex;
  gap: 8px;
}
</style>
