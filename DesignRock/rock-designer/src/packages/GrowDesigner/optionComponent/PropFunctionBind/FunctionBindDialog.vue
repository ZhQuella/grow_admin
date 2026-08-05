<template>
  <GrowDialog
    :model-value="visible"
    :title="dialogTitle"
    width="720px"
    append-to-body
    destroy-on-close
    :z-index="5200"
    class="function-bind-dialog"
    @update:model-value="onVisibleChange"
  >
    <div class="function-bind-dialog__body" @click.stop>
      <p class="function-bind-dialog__hint">
        可用参数：{{ paramsHint }}；以及 state、refs
      </p>
      <div class="function-bind-dialog__editor">
        <GrowCodeEditor
          v-model="draft"
          class="h-full"
          default-language="javascript"
          :language-switchable="false"
          :globals="editorGlobals"
        />
      </div>
      <pre class="function-bind-dialog__example">{{ exampleText }}</pre>
    </div>

    <template #footer>
      <div class="function-bind-dialog__footer">
        <GrowButton size="small" type="danger" plain @click="onRemove">
          清除
        </GrowButton>
        <GrowButton size="small" @click="onCancel">取消</GrowButton>
        <GrowButton size="small" type="primary" @click="onConfirm">
          确定
        </GrowButton>
      </div>
    </template>
  </GrowDialog>
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
    /** 从单一对象参数解构具名参数 */
    objectArgs?: boolean
    example?: string
  }>(),
  {
    title: '',
    modelValue: '',
    params: () => [],
    objectArgs: false,
    example: '',
  },
)

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [value: string]
  remove: []
}>()

const draft = ref('')

const dialogTitle = computed(() =>
  props.title ? `函数绑定 · ${props.title}` : '函数绑定',
)

const paramsHint = computed(() => {
  const list = props.params || []
  if (!list.length) return 'args（数组）'
  if (props.objectArgs) {
    return `${list.join('、')}（从回调对象参数解构）`
  }
  return list.join('、')
})

const editorGlobals = computed(() => {
  const list = props.params?.length ? [...props.params] : ['args']
  for (const name of ['state', 'refs']) {
    if (!list.includes(name)) list.push(name)
  }
  return list
})

const editorGlobals = computed(() => {
  const list = props.params?.length ? [...props.params] : ['args']
  for (const name of ['state', 'refs']) {
    if (!list.includes(name)) list.push(name)
  }
  return list
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

const onVisibleChange = (open: boolean) => {
  emit('update:visible', open)
}

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
.function-bind-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: min(480px, calc(100vh - 220px));
  min-height: 280px;
  overflow: hidden;
  margin: -4px -4px 0;
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
  width: 100%;
}
</style>
