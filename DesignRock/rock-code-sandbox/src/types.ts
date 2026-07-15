import type { Component } from 'vue'

/** 沙箱支持的语言 */
export type CodeLanguage =
  | 'javascript'
  | 'typescript'
  | 'vue'
  | 'html'
  | 'css'
  | 'json'

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
  language?: CodeLanguage
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
  language: CodeLanguage
  dependencies?: CodeDependency[]
  error?: string | null
}
