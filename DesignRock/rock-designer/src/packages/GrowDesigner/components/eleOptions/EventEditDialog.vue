<template>
  <Teleport to="body">
    <div v-if="visible" class="event-edit-dialog" @click.stop>
      <div class="event-edit-dialog__mask" @click="onCancel" />
      <div class="event-edit-dialog__panel" role="dialog" aria-modal="true">
        <header class="event-edit-dialog__header">
          <h3 class="event-edit-dialog__title">
            编辑事件 · {{ eventLabel }}
          </h3>
          <button
            type="button"
            class="event-edit-dialog__close"
            title="关闭"
            @click="onCancel"
          >
            <GrowIconify icon="carbon:close" :size="16" />
          </button>
        </header>

        <div class="event-edit-dialog__body">
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
              可用参数：event、state
            </span>
          </div>
          <div class="event-edit-dialog__editor">
            <GrowCodeEditor
              v-model="draft.code"
              class="h-full"
              default-language="javascript"
              :language-switchable="false"
            />
          </div>
          <pre class="event-edit-dialog__example">{{ EXAMPLE_CODE }}</pre>
        </div>

        <footer class="event-edit-dialog__footer">
          <GrowButton size="small" @click="onCancel">取消</GrowButton>
          <GrowButton size="small" type="primary" @click="onConfirm">
            确定
          </GrowButton>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { GrowCodeEditor } from '@grow-admin-rock/code-sandbox'
import type { DesignerEventItem } from '../../static/elementEvents/types'
import { isEventEnabled } from '../../static/elementEvents/types'

defineOptions({ name: 'EventEditDialog' })

const EXAMPLE_CODE = `// 函数体示例
console.log('event', event)
console.log('state', state)
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
.event-edit-dialog {
  position: fixed;
  inset: 0;
  z-index: 4000;
}

.event-edit-dialog__mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
}

.event-edit-dialog__panel {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  width: min(720px, calc(100vw - 32px));
  height: min(640px, calc(100vh - 48px));
  transform: translate(-50%, -50%);
  border-radius: 10px;
  background: var(--layout-container-background-color, #fff);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.event-edit-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid var(--layout-border-color);
}

.event-edit-dialog__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.event-edit-dialog__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-color-secondary);
  cursor: pointer;

  &:hover {
    background: var(--layout-background-color, #f5f7fa);
    color: var(--text-color);
  }
}

.event-edit-dialog__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
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
  background: var(--layout-background-color, #f5f7fa);
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-color-secondary);
}

.event-edit-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 16px;
  border-top: 1px solid var(--layout-border-color);
}
</style>
