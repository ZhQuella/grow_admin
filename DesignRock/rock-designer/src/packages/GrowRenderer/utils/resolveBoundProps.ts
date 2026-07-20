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

/** 展示用格式化：基础类型与对象/数组原样保留（表单默认值需保留复杂类型） */
export const formatBoundDisplayValue = (value: unknown): any => {
  if (value === undefined) return undefined
  return value
}

/**
 * 按 propBindModes 解析 props：
 * - mode === 'bind'：求值表达式并写回展示值
 * - 其余字段保持原样
 */
export const resolveBoundProps = (
  rawProps: Record<string, any> | undefined,
  bindModes: Record<string, string> | undefined,
  state: Record<string, unknown>,
): Record<string, any> => {
  const result = { ...(rawProps || {}) }
  if (!bindModes) return result
  for (const [key, mode] of Object.entries(bindModes)) {
    if (mode !== 'bind') continue
    const raw = result[key]
    if (raw == null || raw === '') continue
    const evaluated = resolveBoundExpression(String(raw), state)
    if (evaluated === undefined) continue
    result[key] = formatBoundDisplayValue(evaluated)
  }
  return result
}
