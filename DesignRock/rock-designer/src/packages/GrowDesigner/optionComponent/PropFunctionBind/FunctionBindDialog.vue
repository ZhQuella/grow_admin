<template>
  <Teleport to="body">
    <div v-if="visible" class="function-bind-dialog" @click.stop>
      <div class="function-bind-dialog__mask" @click="onCancel" />
      <div class="function-bind-dialog__panel" role="dialog" aria-modal="true">
        <header class="function-bind-dialog__header">
          <h3 class="function-bind-dialog__title">
            函数绑定{{ title ? ` · ${title}` : '' }}
          </h3>
          <button
            type="button"
            class="function-bind-dialog__close"
            title="关闭"
            @click="onCancel"
          >
            <GrowIconify icon="carbon:close" :size="16" />
          </button>
        </header>

        <div class="function-bind-dialog__body">
          <p class="function-bind-dialog__hint">
            可用参数：{{ paramsHint }}；以及 state、refs
          </p>
          <div class="function-bind-dialog__editor">
            <GrowCodeEditor
              v-model="draft"
              class="h-full"
              default-language="javascript"
              :language-switchable="false"
            />
          </div>
          <pre class="function-bind-dialog__example">{{ exampleText }}</pre>
        </div>

        <footer class="function-bind-dialog__footer">
          <GrowButton size="small" type="danger" plain @click="onRemove">
            清除
          </GrowButton>
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
import { computed, ref, watch } from 'vue'
import { GrowCodeEditor } from '@grow-admin-rock/code-sandbox'

defineOptions({ name: 'FunctionBindDialog' })

const props = withDefaults(
  defineProps<{
    visible: boolean
    title?: string
    modelValue?: string
    params?: string[]
    example?: string
  }>(),
  {
    title: '',
    modelValue: '',
    params: () => [],
    example: '',
  },
)

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [value: string]
  remove: []
}>()

const draft = ref('')

const paramsHint = computed(() => {
  const list = props.params || []
  return list.length ? list.join('、') : 'args（数组）'
})

const exampleText = computed(() => {
  if (props.example) return props.example
  const list = props.params || []
  if (!list.length) {
    return `// 示例\nconsole.log('args', args)\nconsole.log('state', state)`
  }
  return `// 示例\nconsole.log(${list.map((p) => `'${p}', ${p}`).join(', ')})\nconsole.log('state', state)`
})

watch(
  () => [props.visible, props.modelValue] as const,
  ([open]) => {
    if (!open) return
    draft.value = props.modelValue == null ? '' : String(props.modelValue)
  },
  { immediate: true },
)

const onCancel = () => emit('update:visible', false)

const onConfirm = () => {
  emit('confirm', draft.value ?? '')
  emit('update:visible', false)
}

const onRemove = () => {
  emit('remove')
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.function-bind-dialog {
  position: fixed;
  inset: 0;
  z-index: 4000;
}

.function-bind-dialog__mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
}

.function-bind-dialog__panel {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  width: min(720px, calc(100vw - 32px));
  height: min(560px, calc(100vh - 48px));
  transform: translate(-50%, -50%);
  border-radius: 10px;
  background: var(--layout-container-background-color, #fff);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.function-bind-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid var(--layout-border-color);
}

.function-bind-dialog__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.function-bind-dialog__close {
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
    background: var(--header-action-hover-bg-color);
    color: var(--text-color);
  }
}

.function-bind-dialog__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  overflow: hidden;
}

.function-bind-dialog__hint {
  margin: 0;
  font-size: 12px;
  color: var(--text-color-secondary);
}

.function-bind-dialog__editor {
  flex: 1;
  min-height: 200px;
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
  overflow: hidden;
}

.function-bind-dialog__example {
  margin: 0;
  max-height: 72px;
  padding: 8px 10px;
  overflow: auto;
  border-radius: 6px;
  background: var(--layout-container-background-color);
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-color-secondary);
}

.function-bind-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 16px;
  border-top: 1px solid var(--layout-border-color);
}
</style>
