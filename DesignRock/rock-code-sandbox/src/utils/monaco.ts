import * as monaco from 'monaco-editor'
import type { editor as MonacoEditor } from 'monaco-editor'
import {
  conf as jsLanguageConf,
  language as jsLanguageTokens,
} from 'monaco-editor/esm/vs/basic-languages/javascript/javascript.js'

export type MonacoTheme = 'vs' | 'vs-dark'

/** 注入到 JS 诊断作用域的全局变量（函数体参数） */
export type MonacoCodeGlobal = {
  name: string
  /** TS 类型文本，默认 any */
  type?: string
}

/** 表达式语言 id：保留 JS 高亮，不挂载 JS/TS 语法诊断 */
const EXPRESSION_LANGUAGE_ID = 'expression'

let expressionLanguageReady = false
let javascriptDefaultsReady = false

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

/**
 * JS 诊断默认配置：去掉 dom lib，避免裸标识符 `event` 命中已废弃的 window.event 删除线。
 * 设计器函数体通过 extras/globals 声明可用参数。
 * 另注入 console ambient，避免示例中的 console.log 被标红。
 */
export function ensureJavascriptDefaults() {
  if (javascriptDefaultsReady) return
  javascriptDefaultsReady = true
  const ts = monaco.languages.typescript
  ts.javascriptDefaults.setCompilerOptions({
    target: ts.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    allowJs: true,
    checkJs: true,
    noEmit: true,
    lib: ['es2020'],
  })
  ts.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    // 设计器编辑的是函数体（运行时 new Function 包裹），允许顶层 return
    diagnosticCodesToIgnore: [
      1108, // A 'return' statement can only be used within a function body.
    ],
  })
  // 无 dom lib 时 console 不存在；设计器示例普遍使用 console.log
  ts.javascriptDefaults.addExtraLib(
    [
      '/** Grow designer console ambient (no dom lib) */',
      'declare const console: {',
      '  log(...data: any[]): void;',
      '  info(...data: any[]): void;',
      '  warn(...data: any[]): void;',
      '  error(...data: any[]): void;',
      '  debug(...data: any[]): void;',
      '  dir(...data: any[]): void;',
      '  table(...data: any[]): void;',
      '  clear(): void;',
      '};',
      '',
    ].join('\n'),
    'ts:grow-code-editor-console.d.ts',
  )
}

const SAFE_GLOBAL_NAME = /^[A-Za-z_$][\w$]*$/

export function normalizeMonacoGlobals(
  globals?: Array<string | MonacoCodeGlobal> | null,
): MonacoCodeGlobal[] {
  if (!globals?.length) return []
  const seen = new Set<string>()
  const result: MonacoCodeGlobal[] = []
  for (const item of globals) {
    const name = typeof item === 'string' ? item : item?.name
    const normalized = String(name || '').trim()
    if (!normalized || !SAFE_GLOBAL_NAME.test(normalized) || seen.has(normalized)) {
      continue
    }
    seen.add(normalized)
    const type =
      typeof item === 'string'
        ? 'any'
        : String(item.type || 'any').trim() || 'any'
    result.push({ name: normalized, type })
  }
  return result
}

export function buildGlobalsExtraLibSource(globals: MonacoCodeGlobal[]): string {
  if (!globals.length) return ''
  const lines = [
    '/** Grow designer / sandbox function-body ambient globals */',
    ...globals.map((item) => `declare const ${item.name}: ${item.type};`),
  ]
  return `${lines.join('\n')}\n`
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
  /** 函数体可用参数，注入为 JS ambient globals */
  globals?: Array<string | MonacoCodeGlobal>
}

export type MonacoEditorHandle = {
  editor: MonacoEditor.IStandaloneCodeEditor
  setGlobals: (globals?: Array<string | MonacoCodeGlobal> | null) => void
  dispose: () => void
}

/**
 * 创建 Monaco 编辑器。
 * worker 由应用侧 vite-plugin-monaco-editor 注入。
 */
export function createMonacoEditor(
  el: HTMLElement,
  options: CreateMonacoOptions,
): MonacoEditorHandle {
  const language = resolveLanguage(options.language)
  if (language === 'javascript') {
    ensureJavascriptDefaults()
  }

  const editor = monaco.editor.create(el, {
    value: options.value,
    language,
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
    editor.onDidChangeModelContent(() => {
      options.onChange?.(editor.getValue())
    })
  }

  const libUri = `ts:grow-code-editor-globals-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.d.ts`

  let extraLib: monaco.IDisposable | null = null

  const setGlobals = (globals?: Array<string | MonacoCodeGlobal> | null) => {
    extraLib?.dispose()
    extraLib = null
    const normalized = normalizeMonacoGlobals(globals)
    const languageId = editor.getModel()?.getLanguageId()
    if (!normalized.length || languageId !== 'javascript') return
    ensureJavascriptDefaults()
    extraLib = monaco.languages.typescript.javascriptDefaults.addExtraLib(
      buildGlobalsExtraLibSource(normalized),
      libUri,
    )
  }

  setGlobals(options.globals)

  const dispose = () => {
    extraLib?.dispose()
    extraLib = null
    editor.dispose()
  }

  return { editor, setGlobals, dispose }
}

export function setMonacoLanguage(
  instance: MonacoEditor.IStandaloneCodeEditor,
  language: string,
) {
  const model = instance.getModel()
  if (model) {
    const next = resolveLanguage(language)
    if (next === 'javascript') ensureJavascriptDefaults()
    monaco.editor.setModelLanguage(model, next)
  }
}

export function setMonacoTheme(theme: MonacoTheme) {
  monaco.editor.setTheme(theme)
}

export { monaco }
