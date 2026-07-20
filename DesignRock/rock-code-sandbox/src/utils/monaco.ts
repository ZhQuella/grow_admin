import * as monaco from 'monaco-editor'
import type { editor as MonacoEditor } from 'monaco-editor'
import {
  conf as jsLanguageConf,
  language as jsLanguageTokens,
} from 'monaco-editor/esm/vs/basic-languages/javascript/javascript.js'

export type MonacoTheme = 'vs' | 'vs-dark'

/** 表达式语言 id：保留 JS 高亮，不挂载 JS/TS 语法诊断 */
const EXPRESSION_LANGUAGE_ID = 'expression'

let expressionLanguageReady = false

/**
 * 注册 expression 语言。
 * 直接写 `{ a: 1 }` 时，若映射为 javascript，会被当成语句块并报 `';' expected`；
 * 独立语言无 worker 校验，适合数据源 / 变量绑定等字面量编辑。
 */
function ensureExpressionLanguage() {
  if (expressionLanguageReady) return
  expressionLanguageReady = true
  const exists = monaco.languages
    .getLanguages()
    .some((item) => item.id === EXPRESSION_LANGUAGE_ID)
  if (!exists) {
    monaco.languages.register({ id: EXPRESSION_LANGUAGE_ID })
  }
  monaco.languages.setMonarchTokensProvider(
    EXPRESSION_LANGUAGE_ID,
    jsLanguageTokens as monaco.languages.IMonarchLanguage,
  )
  monaco.languages.setLanguageConfiguration(
    EXPRESSION_LANGUAGE_ID,
    jsLanguageConf as monaco.languages.LanguageConfiguration,
  )
}

/** 映射到 Monaco language id */
function resolveLanguage(language: string) {
  if (language === 'vue') return 'html'
  if (language === 'expression') {
    ensureExpressionLanguage()
    return EXPRESSION_LANGUAGE_ID
  }
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
