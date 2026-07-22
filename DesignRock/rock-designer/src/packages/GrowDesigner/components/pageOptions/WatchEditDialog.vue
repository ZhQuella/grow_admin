<template>
  <Teleport to="body">
    <div v-if="visible" class="watch-edit-dialog" @click.stop>
      <div class="watch-edit-dialog__mask" @click="onCancel" />
      <div class="watch-edit-dialog__panel" role="dialog" aria-modal="true">
        <header class="watch-edit-dialog__header">
          <h3 class="watch-edit-dialog__title">编辑监听</h3>
          <button
            type="button"
            class="watch-edit-dialog__close"
            title="关闭"
            @click="onCancel"
          >
            <GrowIconify icon="carbon:close" :size="16" />
          </button>
        </header>

        <div class="watch-edit-dialog__body">
          <GrowForm
            label-width="100px"
            label-position="left"
            size="small"
            :show-message="false"
          >
            <GrowFormItem label="监听路径">
              <GrowInput
                v-model="draft.source"
                clearable
                placeholder="如 state.user 或 state.user.name"
              />
            </GrowFormItem>
            <GrowFormItem label="启用绑定">
              <GrowSwitch v-model="draft.enabled" size="small" />
              <span class="watch-edit-dialog__hint">
                开启后预览会监听该路径变化
              </span>
            </GrowFormItem>
            <GrowFormItem label="深度监听">
              <GrowSwitch v-model="draft.deep" size="small" />
              <span class="watch-edit-dialog__hint">
                对象/数组内部变化也触发
              </span>
            </GrowFormItem>
            <GrowFormItem label="立即执行">
              <GrowSwitch v-model="draft.immediate" size="small" />
              <span class="watch-edit-dialog__hint">
                挂载时先用当前值执行一次
              </span>
            </GrowFormItem>
          </GrowForm>

          <div class="watch-edit-dialog__editor-head">
            <span>函数体</span>
            <span class="watch-edit-dialog__hint">
              参数：value、oldValue、state
            </span>
          </div>
          <div class="watch-edit-dialog__editor">
            <GrowCodeEditor
              v-model="draft.code"
              class="h-full"
              default-language="javascript"
              :language-switchable="false"
            />
          </div>
          <pre class="watch-edit-dialog__example">{{ EXAMPLE_CODE }}</pre>
        </div>

        <footer class="watch-edit-dialog__footer">
          <GrowButton size="small" @click="onCancel">取消</GrowButton>
          <GrowButton
            size="small"
            type="primary"
            :disabled="!draft.source"
            @click="onConfirm"
          >
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
import {
  defaultWatcherName,
  type DesignerWatcherItem,
} from '../../static/pageWatchers'

defineOptions({ name: 'WatchEditDialog' })

const EXAMPLE_CODE = `// 函数体示例
console.log('value', value)
console.log('oldValue', oldValue)
console.log('state', state)`

const props = defineProps<{
  visible: boolean
  modelValue: DesignerWatcherItem
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [value: DesignerWatcherItem]
}>()

const draft = reactive<Omit<DesignerWatcherItem, 'name'>>({
  source: '',
  code: '',
  enabled: false,
  deep: false,
  immediate: false,
})

watch(
  () => [props.visible, props.modelValue] as const,
  ([visible]) => {
    if (!visible) return
    const src = props.modelValue || ({} as DesignerWatcherItem)
    draft.source = src.source || ''
    draft.code = src.code ?? ''
    draft.enabled = Boolean(src.enabled)
    draft.deep = Boolean(src.deep)
    draft.immediate = Boolean(src.immediate)
  },
  { immediate: true, deep: true },
)

const onCancel = () => {
  emit('update:visible', false)
}

const onConfirm = () => {
  const source = String(draft.source || '').trim()
  if (!source) return
  emit('confirm', {
    name: defaultWatcherName(source),
    source,
    code: draft.code ?? '',
    enabled: Boolean(draft.enabled),
    deep: Boolean(draft.deep),
    immediate: Boolean(draft.immediate),
  })
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.watch-edit-dialog {
  position: fixed;
  inset: 0;
  z-index: 4000;
}

.watch-edit-dialog__mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
}

.watch-edit-dialog__panel {
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

.watch-edit-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid var(--layout-border-color);
}

.watch-edit-dialog__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.watch-edit-dialog__close {
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

.watch-edit-dialog__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  overflow: hidden;
}

.watch-edit-dialog__hint {
  margin-left: 8px;
  font-size: 12px;
  color: var(--text-color-secondary);
}

.watch-edit-dialog__editor-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 500;
}

.watch-edit-dialog__editor {
  flex: 1;
  min-height: 200px;
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
  overflow: hidden;
}

.watch-edit-dialog__example {
  margin: 0;
  max-height: 64px;
  padding: 8px 10px;
  overflow: auto;
  border-radius: 6px;
  background: var(--layout-background-color, #f5f7fa);
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-color-secondary);
}

.watch-edit-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 16px;
  border-top: 1px solid var(--layout-border-color);
}
</style>
