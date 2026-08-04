<template>
  <GrowDialog
    :model-value="visible"
    :title="`编辑事件 · ${eventLabel}`"
    width="720px"
    append-to-body
    destroy-on-close
    class="event-edit-dialog"
    @update:model-value="onVisibleChange"
  >
    <div class="event-edit-dialog__body" @click.stop>
      <GrowForm
        label-width="100px"
        label-position="left"
        size="small"
        :show-message="false"
      >
        <GrowFormItem label="函数名">
          <GrowInput
            v-model="draft.name"
            clearable
            placeholder="如 onClick"
          />
        </GrowFormItem>
        <GrowFormItem label="启用绑定">
          <GrowSwitch v-model="draft.enabled" size="small" />
          <span class="event-edit-dialog__hint">
            开启后预览/运行时会绑定并执行该事件
          </span>
        </GrowFormItem>
        <GrowFormItem label="事件类型">
          <span class="event-edit-dialog__type">{{ draft.eventType }}</span>
        </GrowFormItem>
      </GrowForm>

      <div class="event-edit-dialog__editor-head">
        <span>函数体</span>
        <span class="event-edit-dialog__hint">
          可用参数：event、state、apis、refs
        </span>
      </div>
      <div class="event-edit-dialog__editor">
        <GrowCodeEditor
          v-model="draft.code"
          class="h-full"
          default-language="javascript"
          :language-switchable="false"
          :globals="CODE_EDITOR_EVENT_GLOBALS"
        />
      </div>
      <pre class="event-edit-dialog__example">{{ EXAMPLE_CODE }}</pre>
    </div>

    <template #footer>
      <div class="event-edit-dialog__footer">
        <GrowButton size="small" @click="onCancel">取消</GrowButton>
        <GrowButton size="small" type="primary" @click="onConfirm">
          确定
        </GrowButton>
      </div>
    </template>
  </GrowDialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { GrowCodeEditor, CODE_EDITOR_EVENT_GLOBALS } from '@grow-admin-rock/code-sandbox'
import type { DesignerEventItem } from '../../static/elementEvents/types'
import { isEventEnabled } from '../../static/elementEvents/types'

defineOptions({ name: 'EventEditDialog' })

const EXAMPLE_CODE = `// 函数体示例
console.log('event', event)
console.log('state', state)
// 调用「数据请求」面板中配置的同名方法
// await apis.getList()
// 调用高级面板配置了 Ref 名称的组件实例
// refs.form?.validate?.()
// state.user.name = 'Bob'`

const props = defineProps<{
  visible: boolean
  eventLabel: string
  modelValue: DesignerEventItem
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [value: DesignerEventItem]
}>()

const draft = reactive<DesignerEventItem>({
  name: 'onClick',
  eventType: 'click',
  code: '',
  enabled: false,
})

watch(
  () => [props.visible, props.modelValue] as const,
  ([visible]) => {
    if (!visible) return
    const src = props.modelValue || ({} as DesignerEventItem)
    draft.name = src.name || 'onClick'
    draft.eventType = src.eventType || 'click'
    draft.code = src.code ?? ''
    draft.enabled = isEventEnabled(src)
  },
  { immediate: true, deep: true },
)

const onVisibleChange = (open: boolean) => {
  emit('update:visible', open)
}

const onCancel = () => {
  emit('update:visible', false)
}

const onConfirm = () => {
  emit('confirm', {
    name: String(draft.name || '').trim() || 'handler',
    eventType: draft.eventType,
    code: draft.code ?? '',
    enabled: Boolean(draft.enabled),
  })
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.event-edit-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: min(500px, calc(100vh - 220px));
  min-height: 360px;
  overflow: hidden;
}

.event-edit-dialog__hint {
  margin-left: 8px;
  font-size: 12px;
  color: var(--text-color-secondary);
}

.event-edit-dialog__type {
  font-size: 13px;
  color: var(--text-color-secondary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.event-edit-dialog__editor-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 500;
}

.event-edit-dialog__editor {
  flex: 1;
  min-height: 220px;
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
  overflow: hidden;
}

.event-edit-dialog__example {
  margin: 0;
  max-height: 72px;
  padding: 8px 10px;
  overflow: auto;
  border-radius: 6px;
  border: 1px solid var(--layout-border-color);
  background: var(--layout-container-background-color);
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-color-secondary);
}

.event-edit-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
}
</style>
