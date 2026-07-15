<template>
  <div class="grow-code-editor h-full min-h-0 overflow-hidden">
    <div ref="editorEl" class="h-full min-h-0 w-full" />
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { editor as MonacoEditor } from 'monaco-editor'
import type { CodeEditorOptions, CodeLanguage } from '#/types'
import {
  createMonacoEditor,
  setMonacoLanguage,
  setMonacoTheme,
  type MonacoTheme,
} from '#/utils/monaco'

defineOptions({
  name: 'GrowCodeEditor',
})

const props = withDefaults(
  defineProps<{
    modelValue?: string
    language?: CodeLanguage
    options?: CodeEditorOptions
  }>(),
  {
    modelValue: '',
    language: 'vue',
    options: () => ({}),
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorEl = ref<HTMLElement | null>(null)
let editor: MonacoEditor.IStandaloneCodeEditor | null = null
let applyingExternal = false

const monacoLanguage = computed(() => props.language || 'vue')

const monacoTheme = computed<MonacoTheme>(() => {
  const theme = props.options.theme ?? 'auto'
  if (theme === 'dark') return 'vs-dark'
  if (theme === 'light') return 'vs'
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return 'vs-dark'
  }
  return 'vs'
})

onMounted(async () => {
  await nextTick()
  if (!editorEl.value) return
  editor = createMonacoEditor(editorEl.value, {
    value: props.modelValue,
    language: monacoLanguage.value,
    theme: monacoTheme.value,
    readOnly: props.options.readonly,
    onChange: (value) => {
      if (applyingExternal) return
      emit('update:modelValue', value)
    },
  })
})

onBeforeUnmount(() => {
  editor?.dispose()
  editor = null
})

watch(
  () => props.modelValue,
  (value) => {
    if (!editor) return
    const next = value ?? ''
    if (editor.getValue() === next) return
    applyingExternal = true
    editor.setValue(next)
    applyingExternal = false
  },
)

watch(monacoLanguage, (language) => {
  if (!editor) return
  setMonacoLanguage(editor, language)
})

watch(monacoTheme, (theme) => {
  setMonacoTheme(theme)
})

watch(
  () => props.options.readonly,
  (readOnly) => {
    editor?.updateOptions({ readOnly: Boolean(readOnly) })
  },
)
</script>
