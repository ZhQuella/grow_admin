/** 变量绑定：由 dataSource 构建 state，并按 propBindModes 求值 */

export type DataSourceLike = {
  id?: string
  name?: string
  data?: string
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

/** dataSource 列表 → state 对象（key 为数据源 name） */
export const buildRuntimeState = (dataSource: unknown): Record<string, unknown> => {
  const state: Record<string, unknown> = {}
  if (!Array.isArray(dataSource)) return state
  for (const item of dataSource as DataSourceLike[]) {
    if (!item || typeof item !== 'object') continue
    const name = String(item.name ?? '').trim()
    if (!name) continue
    state[name] = evaluateExpression(String(item.data ?? ''))
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

/**
 * 按 propBindModes 解析 props：
 * - mode === 'bind'：求值表达式并写回展示值
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
