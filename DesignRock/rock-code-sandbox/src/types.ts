import type { Component } from 'vue'

/**
 * GrowCodeEditor 内置语言（不含 typescript）。
 * expression：直接书写 JS 字面量 / 表达式（如 `{ a: 1 }`、`state.x`）；
 * 使用独立 Monaco 语言，避免按 JS 语句校验导致对象字面量误报。
 */
export type CodeEditorLanguage =
  | 'javascript'
  | 'html'
  | 'css'
  | 'json'
  | 'vue'
  | 'sql'
  | 'expression'

/** @deprecated 请使用 CodeEditorLanguage；沙箱场景可继续用扩展语言 */
export type CodeLanguage = CodeEditorLanguage | 'typescript'

/** 编辑器语言选项（供 Select 展示） */
export interface CodeEditorLanguageOption {
  label: string
  value: CodeEditorLanguage
}

export const CODE_EDITOR_LANGUAGE_OPTIONS: CodeEditorLanguageOption[] = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'JSON', value: 'json' },
  { label: 'Vue 3', value: 'vue' },
  { label: 'SQL', value: 'sql' },
  { label: '表达式', value: 'expression' },
]

/** 语言切换事件载荷 */
export interface CodeEditorLanguageChangePayload {
  from: CodeEditorLanguage
  to: CodeEditorLanguage
}

/** before 事件可调用 preventDefault 取消切换 */
export interface CodeEditorBeforeLanguageChangePayload
  extends CodeEditorLanguageChangePayload {
  preventDefault: () => void
}

/** 依赖来源：npm 包，或宿主注入的能力（组件库 / 请求等） */
export type CodeDependencySource = 'npm' | 'host'

/** 依赖类型 */
export type CodeDependencyKind = 'component' | 'api' | 'util'

/** 编辑过程中动态注入的依赖项 */
export interface CodeDependency {
  /** 包名或注入标识，如 @grow-admin-rock/utils / GrowButton / useRequest */
  name: string
  /** 版本（npm）或标签（host） */
  version?: string
  source?: CodeDependencySource
  kind?: CodeDependencyKind
  /** 是否启用（默认 true）；locked 项始终视为启用 */
  enabled?: boolean
  /**
   * 默认注入：不可取消勾选、不可删除。
   * 如 useRequest、@grow-admin-rock/state 等。
   */
  locked?: boolean
  /**
   * npm 包动态加载后，要作为可直接调用方法挂到 script 的导出名。
   * 如 nanoid → injectAs: ['nanoid']，脚本内写 nanoid()。
   * 未填时默认尝试与包短名同名的导出。
   */
  injectAs?: string[]
  /** 宿主侧实际暴露的模块 / 组件（预留） */
  value?: unknown
}

/**
 * 宿主注入给沙箱的能力面。
 * 预览运行在宿主 Vue 树内，组件可继续走 Grow 驱动 / IOC。
 *
 * - components：可选补充；组件依赖按名从宿主全局解析，模板直接使用，无需 import
 * - apis：注入到 script 作用域，按名称调用（如 useRequest()）
 * - utils：注入到 script 作用域的工具值
 * - modules：可按包名 import 的模块表
 */
export interface SandboxExpose {
  components?: Record<string, Component>
  apis?: Record<string, (...args: any[]) => any>
  utils?: Record<string, unknown>
  modules?: Record<string, Record<string, unknown> | object>
}

/** 编辑器配置 */
export interface CodeEditorOptions {
  readonly?: boolean
  theme?: 'light' | 'dark' | 'auto'
  /** 是否展示行号 */
  lineNumbers?: boolean
  /** 是否自动换行 */
  wordWrap?: boolean
}

/** 沙箱运行态 */
export interface CodeSandboxState {
  code: string
  dependencies?: CodeDependency[]
  error?: string | null
}
