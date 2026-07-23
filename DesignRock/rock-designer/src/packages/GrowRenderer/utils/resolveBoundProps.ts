/** 变量绑定：由 dataSource / computedProps 构建 state，并按 propBindModes 求值 */

import { compileDesignerPropFunction } from './runDesignerPropFunction'

export type DataSourceLike = {
  id?: string
  name?: string
  data?: string
}

export type ComputedPropLike = {
  id?: string
  name?: string
  code?: string
}

/** 安全求值表达式字面量（如 `"x"` / `123` / `{ a: 1 }`） */
export const evaluateExpression = (code: string): unknown => {
  const trimmed = String(code ?? '').trim()
  if (!trimmed) return undefined
  try {
    // eslint-disable-next-line no-new-func
    return new Function(`"use strict"; return (${trimmed});`)()
  } catch {
    return undefined
  }
}

/** 在 state 上下文中求值计算属性表达式 */
export const evaluateComputedExpression = (
  code: string,
  state: Record<string, unknown>,
): unknown => {
  const trimmed = String(code ?? '').trim()
  if (!trimmed) return undefined
  try {
    // eslint-disable-next-line no-new-func
    return new Function('state', `"use strict"; return (${trimmed});`)(state)
  } catch (error) {
    console.warn('[GrowComputedProp]', error)
    return undefined
  }
}

/** dataSource 列表 → state；再按顺序写入 computedProps */
export const buildRuntimeState = (
  dataSource: unknown,
  computedProps?: unknown,
): Record<string, unknown> => {
  const state: Record<string, unknown> = {}
  if (Array.isArray(dataSource)) {
    for (const item of dataSource as DataSourceLike[]) {
      if (!item || typeof item !== 'object') continue
      const name = String(item.name ?? '').trim()
      if (!name) continue
      state[name] = evaluateExpression(String(item.data ?? ''))
    }
  }
  if (Array.isArray(computedProps)) {
    for (const item of computedProps as ComputedPropLike[]) {
      if (!item || typeof item !== 'object') continue
      const name = String(item.name ?? '').trim()
      if (!name) continue
      state[name] = evaluateComputedExpression(String(item.code ?? ''), state)
    }
  }
  return state
}

/** 用 next 覆盖 target 的键（保持 target 引用稳定，便于 reactive 回写） */
export const syncRuntimeState = (
  target: Record<string, unknown>,
  next: Record<string, unknown>,
) => {
  for (const key of Object.keys(target)) {
    if (!(key in next)) Reflect.deleteProperty(target, key)
  }
  Object.assign(target, next)
}

/** 在 state 上下文中求值绑定表达式（如 state.title） */
export const resolveBoundExpression = (
  expr: string,
  state: Record<string, unknown>,
): unknown => {
  const trimmed = String(expr ?? '').trim()
  if (!trimmed) return undefined
  try {
    // eslint-disable-next-line no-new-func
    return new Function('state', `"use strict"; return (${trimmed});`)(state)
  } catch {
    return undefined
  }
}

/** 将 state.user.name 解析为相对 state 的路径段 */
export const parseStatePath = (expr: string): string[] | null => {
  const trimmed = String(expr ?? '').trim()
  const matched = trimmed.match(/^state\.([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)$/)
  if (!matched) return null
  return matched[1].split('.')
}

/** 按 state.xxx.yyy 路径写入 runtime state（支持双向绑定） */
export const setByStateExpression = (
  state: Record<string, unknown>,
  expr: string,
  value: unknown,
): boolean => {
  const path = parseStatePath(expr)
  if (!path?.length) return false
  let cursor: any = state
  for (let i = 0; i < path.length - 1; i += 1) {
    const key = path[i]
    const next = cursor?.[key]
    if (next == null || typeof next !== 'object') {
      cursor[key] = {}
    }
    cursor = cursor[key]
  }
  cursor[path[path.length - 1]] = value
  return true
}

/** 是否应把求值结果当作表单控件的 modelValue */
export const isAssignableModelValue = (value: unknown): boolean => {
  if (value === undefined) return false
  if (value === null) return true
  const type = typeof value
  if (type === 'string' || type === 'number' || type === 'boolean') return true
  if (Array.isArray(value)) return true
  if (value instanceof Date) return true
  // 纯对象一般不能直接给 Input/Select 当 v-model，需绑到具体属性
  return false
}

/** 将绑定/配置值规范为布尔（空值回退 defaultValue） */
export const coerceBool = (value: unknown, defaultValue = true): boolean => {
  if (value === undefined || value === null || value === '') return defaultValue
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    const text = value.trim().toLowerCase()
    if (text === 'true' || text === '1') return true
    if (text === 'false' || text === '0') return false
  }
  return Boolean(value)
}

/** 展示用格式化：基础类型与对象/数组原样保留（表单默认值需保留复杂类型） */
export const formatBoundDisplayValue = (value: unknown): any => {
  if (value === undefined) return undefined
  return value
}

/** 是否应按 model 表达式做绑定（bind 模式或显式 state.xxx） */
export const isModelBindExpression = (
  expr: string,
  bindModes: Record<string, string> | undefined,
): boolean => {
  const trimmed = String(expr ?? '').trim()
  if (!trimmed) return false
  return bindModes?.model === 'bind' || /\bstate\./.test(trimmed)
}

/**
 * model 绑定：表达式（如 state.form.name）求值后写入 modelValue，供组件 v-model 使用。
 * 不把求值结果写回 model，以免丢失绑定路径。
 */
export const applyModelBinding = (
  result: Record<string, any>,
  bindModes: Record<string, string> | undefined,
  state: Record<string, unknown>,
) => {
  const raw = result.model
  if (raw == null || raw === '') return

  const expr = String(raw).trim()
  if (!isModelBindExpression(expr, bindModes)) return

  const evaluated = resolveBoundExpression(expr, state)
  if (!isAssignableModelValue(evaluated)) return

  const value = formatBoundDisplayValue(evaluated)
  result.modelValue = value
  // Naive 系 / 双写兼容
  result.value = value
}

/** 解析 Tabs/Collapse 的 model 字面量（支持 JSON 数组） */
export const parseContainerActiveLiteral = (raw: unknown): unknown => {
  if (typeof raw !== 'string') return raw
  const trimmed = raw.trim()
  if (!trimmed) return trimmed
  if (
    (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
    (trimmed.startsWith('{') && trimmed.endsWith('}'))
  ) {
    try {
      return JSON.parse(trimmed)
    } catch {
      /* 非 JSON 时按原字符串 */
    }
  }
  return trimmed
}

/** 折叠面板：按 accordion 适配激活值类型 */
export const adaptCollapseActiveValue = (
  value: unknown,
  accordion: boolean,
): unknown => {
  if (accordion) {
    return Array.isArray(value) ? value[0] : value
  }
  if (Array.isArray(value)) return value
  if (value == null || value === '') return []
  return [value]
}

/**
 * Tabs / Collapse 激活值：
 * - model 为绑定表达式 → 用求值后的 modelValue
 * - model 为字面量 → 直接作为激活值（替代原「默认值」）
 * - 否则回退 modelValue（子项管理写入）
 */
export const resolveContainerActiveValue = (
  rawProps: Record<string, any> | undefined,
  bindModes: Record<string, string> | undefined,
  state: Record<string, unknown>,
  options?: { collapse?: boolean },
): unknown => {
  const resolved = resolveBoundProps(rawProps, bindModes, state)
  const modelRaw = rawProps?.model
  let value: unknown = resolved.modelValue

  if (modelRaw != null && modelRaw !== '') {
    const expr = String(modelRaw).trim()
    if (isModelBindExpression(expr, bindModes)) {
      value = resolved.modelValue
    } else {
      value = parseContainerActiveLiteral(modelRaw)
    }
  }

  if (options?.collapse) {
    return adaptCollapseActiveValue(value, Boolean(rawProps?.accordion))
  }
  return value
}

/** Tabs / Collapse 激活值写回：优先 model 绑定，否则写 model 字面量 / modelValue */
export const writeContainerActiveValue = (
  state: Record<string, unknown> | null | undefined,
  rawProps: Record<string, any> | undefined,
  bindModes: Record<string, string> | undefined,
  value: unknown,
): boolean => {
  if (writeModelBinding(state, rawProps, bindModes, value)) return true
  if (!rawProps) return false

  const modelRaw = rawProps.model
  if (
    modelRaw != null &&
    modelRaw !== '' &&
    !isModelBindExpression(String(modelRaw), bindModes)
  ) {
    rawProps.model =
      typeof value === 'string' || typeof value === 'number'
        ? value
        : JSON.stringify(value ?? '')
    rawProps.modelValue = value
    return true
  }

  rawProps.modelValue = value
  return true
}

/** 将控件变更写回 runtime state（双向绑定） */
export const writeModelBinding = (
  state: Record<string, unknown> | null | undefined,
  rawProps: Record<string, any> | undefined,
  bindModes: Record<string, string> | undefined,
  value: unknown,
): boolean => {
  if (!state || !rawProps) return false

  // 优先 model 字段（表单字段绑定）
  const modelRaw = rawProps.model
  if (modelRaw != null && modelRaw !== '') {
    const expr = String(modelRaw).trim()
    if (isModelBindExpression(expr, bindModes)) {
      return setByStateExpression(state, expr, value)
    }
  }

  // 回退：默认值 / 文件列表等 bind 到 state.xxx
  for (const key of ['modelValue', 'file-list', 'fileList', 'value'] as const) {
    if (bindModes?.[key] !== 'bind') continue
    const raw = rawProps[key]
    if (raw == null || raw === '') continue
    const expr = String(raw).trim()
    if (!parseStatePath(expr)) continue
    return setByStateExpression(state, expr, value)
  }

  return false
}

/** 将任意 prop 的 bind 表达式写回 state（如 columns → state.xxx） */
export const writeBoundPropValue = (
  state: Record<string, unknown> | null | undefined,
  rawProps: Record<string, any> | undefined,
  bindModes: Record<string, string> | undefined,
  modelKey: string,
  value: unknown,
): boolean => {
  if (!state || !rawProps || !modelKey) return false
  if (bindModes?.[modelKey] !== 'bind') return false
  const raw = rawProps[modelKey]
  if (raw == null || raw === '') return false
  const expr = String(raw).trim()
  if (!parseStatePath(expr)) return false
  return setByStateExpression(state, expr, value)
}

/**
 * 按 propBindModes 解析 props：
 * - mode === 'bind'：求值表达式并写回展示值
 * - mode === 'function'：编译为可调用函数
 * - model：特殊处理 → 写入 modelValue，保留路径
 * - 其余字段保持原样
 */
export const resolveBoundProps = (
  rawProps: Record<string, any> | undefined,
  bindModes: Record<string, string> | undefined,
  state: Record<string, unknown>,
): Record<string, any> => {
  const result = { ...(rawProps || {}) }
  if (bindModes) {
    for (const [key, mode] of Object.entries(bindModes)) {
      if (mode === 'function') {
        const raw = result[key]
        const code = raw == null ? '' : String(raw)
        const fn = compileDesignerPropFunction(code, state, { modelKey: key })
        if (fn) result[key] = fn
        else Reflect.deleteProperty(result, key)
        continue
      }
      if (mode !== 'bind') continue
      // model 由 applyModelBinding 处理，避免把路径替换成叶子值
      if (key === 'model') continue
      const raw = result[key]
      if (raw == null || raw === '') continue
      const evaluated = resolveBoundExpression(String(raw), state)
      if (evaluated === undefined) continue
      result[key] = formatBoundDisplayValue(evaluated)
    }
  }
  applyModelBinding(result, bindModes, state)
  return result
}
