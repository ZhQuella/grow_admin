import * as monaco from 'monaco-editor'
import type { editor as MonacoEditor } from 'monaco-editor'

export type MonacoTheme = 'vs' | 'vs-dark'

/** 映射到 Monaco 内置 language id */
function resolveLanguage(language: string) {
  if (language === 'vue') return 'html'
  // 表达式：直接书写字面量（字符串/数字/布尔/对象/数组/null），沿用 JS 高亮
  if (language === 'expression') return 'javascript'
  return language
}

export interface CreateMonacoOptions {
  value: string
  language: string
  theme?: MonacoTheme
  readOnly?: boolean
  onChange?: (value: string) => void
}

/**
 * 创建 Monaco 编辑器。
 * worker 由应用侧 vite-plugin-monaco-editor 注入。
 */
export function createMonacoEditor(
  el: HTMLElement,
  options: CreateMonacoOptions,
): MonacoEditor.IStandaloneCodeEditor {
  const instance = monaco.editor.create(el, {
    value: options.value,
    language: resolveLanguage(options.language),
    theme: options.theme ?? 'vs',
    readOnly: options.readOnly ?? false,
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 13,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    tabSize: 2,
    wordWrap: 'on',
    padding: { top: 8, bottom: 8 },
  })

  if (options.onChange) {
    instance.onDidChangeModelContent(() => {
      options.onChange?.(instance.getValue())
    })
  }

  return instance
}

export function setMonacoLanguage(
  instance: MonacoEditor.IStandaloneCodeEditor,
  language: string,
) {
  const model = instance.getModel()
  if (model) {
    monaco.editor.setModelLanguage(model, resolveLanguage(language))
  }
}

export function setMonacoTheme(theme: MonacoTheme) {
  monaco.editor.setTheme(theme)
}

export { monaco }
