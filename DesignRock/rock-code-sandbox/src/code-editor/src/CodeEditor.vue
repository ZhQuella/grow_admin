<template>
  <div class="grow-code-editor flex h-full min-h-0 flex-col overflow-hidden bg-component">
    <div
      v-if="languageSwitchable"
      class="flex shrink-0 items-center justify-end gap-2 border-b border-solid border-border px-2 py-1.5"
    >
      <GrowSelect
        class="w-[140px]"
        size="small"
        :model-value="currentLanguage"
        :options="languageOptions"
        @update:model-value="onSelectLanguage"
      />
    </div>
    <div ref="editorEl" class="min-h-0 flex-1 w-full" />
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { editor as MonacoEditor } from 'monaco-editor'
import {
  CODE_EDITOR_LANGUAGE_OPTIONS,
  type CodeEditorBeforeLanguageChangePayload,
  type CodeEditorGlobal,
  type CodeEditorLanguage,
  type CodeEditorLanguageChangePayload,
  type CodeEditorOptions,
} from '#/types'
import {
  createMonacoEditor,
  setMonacoLanguage,
  setMonacoTheme,
  type MonacoEditorHandle,
  type MonacoTheme,
} from '#/utils/monaco'

defineOptions({
  name: 'GrowCodeEditor',
})

const props = withDefaults(
  defineProps<{
    modelValue?: string
    /** 初始语言，仅作挂载时默认值 */
    defaultLanguage?: CodeEditorLanguage
    /** 是否展示语言切换 Select，默认 true */
    languageSwitchable?: boolean
    options?: CodeEditorOptions
    /**
     * 函数体可用参数（注入 JS ambient globals）。
     * 如事件：['event','state','apis','refs']，避免 `event` 被当成废弃的 window.event。
     */
    globals?: Array<string | CodeEditorGlobal>
  }>(),
  {
    modelValue: '',
    defaultLanguage: 'javascript',
    languageSwitchable: true,
    options: () => ({}),
    globals: () => [],
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  beforeLanguageChange: [payload: CodeEditorBeforeLanguageChangePayload]
  afterLanguageChange: [payload: CodeEditorLanguageChangePayload]
}>()

const languageOptions = CODE_EDITOR_LANGUAGE_OPTIONS
const currentLanguage = ref<CodeEditorLanguage>(props.defaultLanguage)
const editorEl = ref<HTMLElement | null>(null)
let handle: MonacoEditorHandle | null = null
let editor: MonacoEditor.IStandaloneCodeEditor | null = null
let applyingExternal = false

const htmlDark = ref(
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
)

const monacoTheme = computed<MonacoTheme>(() => {
  const theme = props.options.theme ?? 'auto'
  if (theme === 'dark') return 'vs-dark'
  if (theme === 'light') return 'vs'
  return htmlDark.value ? 'vs-dark' : 'vs'
})

let darkClassObserver: MutationObserver | null = null

function changeLanguage(next: CodeEditorLanguage) {
  const from = currentLanguage.value
  if (next === from) return
  if (!languageOptions.some((item) => item.value === next)) return

  let prevented = false
  emit('beforeLanguageChange', {
    from,
    to: next,
    preventDefault: () => {
      prevented = true
    },
  })
  if (prevented) return

  currentLanguage.value = next
  if (editor) {
    setMonacoLanguage(editor, next)
    handle?.setGlobals(next === 'javascript' ? props.globals : [])
  }
  emit('afterLanguageChange', { from, to: next })
}

function onSelectLanguage(value: string | number | null | undefined) {
  if (value == null || value === '') return
  changeLanguage(String(value) as CodeEditorLanguage)
}

/** 供外部主动切换语言（同样走 before / after） */
function setLanguage(language: CodeEditorLanguage) {
  changeLanguage(language)
}

function getLanguage() {
  return currentLanguage.value
}

defineExpose({
  setLanguage,
  getLanguage,
})

onMounted(async () => {
  const root = document.documentElement
  htmlDark.value = root.classList.contains('dark')
  darkClassObserver = new MutationObserver(() => {
    htmlDark.value = root.classList.contains('dark')
  })
  darkClassObserver.observe(root, { attributes: true, attributeFilter: ['class'] })

  await nextTick()
  if (!editorEl.value) return
  handle = createMonacoEditor(editorEl.value, {
    value: props.modelValue,
    language: currentLanguage.value,
    theme: monacoTheme.value,
    readOnly: props.options.readonly,
    globals: props.globals,
    onChange: (value) => {
      if (applyingExternal) return
      emit('update:modelValue', value)
    },
  })
  editor = handle.editor
})

onBeforeUnmount(() => {
  darkClassObserver?.disconnect()
  darkClassObserver = null
  handle?.dispose()
  handle = null
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

watch(monacoTheme, (theme) => {
  setMonacoTheme(theme)
})

watch(
  () => props.options.readonly,
  (readOnly) => {
    editor?.updateOptions({ readOnly: Boolean(readOnly) })
  },
)

watch(
  () => props.globals,
  (globals) => {
    if (currentLanguage.value !== 'javascript') {
      handle?.setGlobals([])
      return
    }
    handle?.setGlobals(globals)
  },
  { deep: true },
)
</script>
