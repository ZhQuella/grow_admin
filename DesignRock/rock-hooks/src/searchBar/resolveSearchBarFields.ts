/** 高级搜索 search[]：绑定求值 / 远程方法编译（供 Renderer 使用，不进 rock-components） */

export type SearchBarFieldLike = {
  elType?: string
  model: string
  labelText?: string
  options?: unknown
  label?: string
  value?: string
  loading?: unknown
  remote?: unknown
  filterable?: unknown
  'remote-method'?: unknown
  remoteMethod?: unknown
  [key: string]: unknown
}

export type ResolveSearchBarFieldsOptions = {
  /** 运行时 refs（函数体内可用） */
  refs?: Record<string, unknown>
  /**
   * 字段级绑定模式：field.model → { options?: 'bind'|'text'|'function', ... }
   * 未提供时：state 表达式仍按绑定求值；字符串 remote-method 按函数编译
   */
  fieldBindModes?: Record<string, Record<string, string>>
}

const isStateBindExpression = (expr: unknown): expr is string => {
  if (typeof expr !== 'string') return false
  return /^\s*(?:return\s+)?state\s*(\.|\[)/.test(expr)
}

const shouldEvaluate = (raw: unknown, mode: string | undefined): boolean => {
  if (mode === 'function') return false
  if (mode === 'bind') return true
  if (mode === 'text') return false
  return isStateBindExpression(raw)
}

/** 与设计器变量绑定一致：支持 state.xxx 或 return 函数体 */
export const evaluateSearchBarExpression = (
  expr: string,
  state: Record<string, unknown>,
): unknown => {
  const trimmed = String(expr ?? '').trim()
  if (!trimmed) return undefined
  const body = /^state\.([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)$/.test(trimmed)
    ? `return ${trimmed}`
    : trimmed
  try {
    // eslint-disable-next-line no-new-func
    return new Function('state', `"use strict";\n${body}`)(state)
  } catch {
    return undefined
  }
}

type DecodedFn = { code: string; params: string[] }

/** 兼容设计器函数 prop 的 JSON 编码（__fn） */
const decodeFunctionSource = (raw: unknown): DecodedFn => {
  if (raw == null || raw === '') return { code: '', params: [] }
  if (typeof raw === 'function') return { code: '', params: [] }
  const str = String(raw)
  const trimmed = str.trim()
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as {
        __fn?: number
        code?: string
        params?: string[]
      }
      if (parsed && parsed.__fn === 1) {
        return {
          code: String(parsed.code ?? ''),
          params: Array.isArray(parsed.params)
            ? parsed.params.map((item) => String(item || '').trim()).filter(Boolean)
            : [],
        }
      }
    } catch {
      // 普通函数体也可能以 { 开头
    }
  }
  return { code: str, params: [] }
}

const SAFE_NAME_RE = /^[A-Za-z_$][\w$]*$/

/** 将 remote-method 源码编译为 (query, ...) => any，闭包注入 state / refs */
export const compileSearchBarRemoteMethod = (
  codeOrEncoded: unknown,
  state: Record<string, unknown>,
  refs: Record<string, unknown> = {},
  defaultParams: string[] = ['query'],
): ((...args: unknown[]) => unknown) | undefined => {
  if (typeof codeOrEncoded === 'function') {
    return codeOrEncoded as (...args: unknown[]) => unknown
  }
  const decoded = decodeFunctionSource(codeOrEncoded)
  const body = decoded.code.trim()
  if (!body) return undefined

  const params = (decoded.params.length ? decoded.params : defaultParams).filter((item) =>
    SAFE_NAME_RE.test(item),
  )
  const prelude = params.map((param, index) => `const ${param} = args[${index}];`).join('\n')

  try {
    // eslint-disable-next-line no-new-func
    const runner = new Function(
      'args',
      'state',
      'refs',
      `"use strict";\n${prelude}\n${body}`,
    )
    return (...args: unknown[]) => runner(args, state, refs)
  } catch (error) {
    console.warn('[resolveSearchBarFields] remote-method compile failed', error)
    return undefined
  }
}

const resolveFieldValue = (
  field: SearchBarFieldLike,
  key: string,
  state: Record<string, unknown>,
  fieldModes: Record<string, string> | undefined,
): unknown => {
  const raw = field[key]
  const mode = fieldModes?.[key]
  if (raw == null || raw === '') return raw
  if (!shouldEvaluate(raw, mode)) return raw
  return evaluateSearchBarExpression(String(raw), state)
}

/** 解析单条搜索字段：options / loading 绑定 + remote-method 编译（label/value 映射仍由 AbstractEle 处理） */
export const resolveSearchBarField = (
  field: SearchBarFieldLike,
  state: Record<string, unknown> = {},
  options: ResolveSearchBarFieldsOptions = {},
): SearchBarFieldLike => {
  if (!field || typeof field !== 'object') return field

  const refs = options.refs || {}
  const embeddedModes =
    field._bindModes && typeof field._bindModes === 'object'
      ? (field._bindModes as Record<string, string>)
      : undefined
  const fieldModes =
    options.fieldBindModes?.[String(field.model ?? '')] || embeddedModes
  const next: SearchBarFieldLike = { ...field }
  Reflect.deleteProperty(next, 'id')
  Reflect.deleteProperty(next, '_bindModes')

  const optionsMode = fieldModes?.options
  if (optionsMode === 'function') {
    const fn = compileSearchBarRemoteMethod(field.options, state, refs, [])
    if (fn) {
      try {
        next.options = fn()
      } catch {
        next.options = []
      }
    }
  } else {
    next.options = resolveFieldValue(field, 'options', state, fieldModes)
  }

  next.data = resolveFieldValue(field, 'data', state, fieldModes)
  // TreeSelect：options / data 互为兜底
  if (next.data == null && next.options != null) next.data = next.options
  if (next.options == null && next.data != null) next.options = next.data

  next.loading = resolveFieldValue(field, 'loading', state, fieldModes)

  const remoteRaw = field['remote-method'] ?? field.remoteMethod
  const remoteMode = fieldModes?.['remote-method'] ?? fieldModes?.remoteMethod
  if (remoteRaw != null && remoteRaw !== '') {
    if (
      typeof remoteRaw === 'function' ||
      remoteMode === 'function' ||
      typeof remoteRaw === 'string'
    ) {
      const fn = compileSearchBarRemoteMethod(remoteRaw, state, refs, ['query'])
      if (fn) {
        next['remote-method'] = fn
        next.remoteMethod = fn
      } else {
        Reflect.deleteProperty(next, 'remote-method')
        Reflect.deleteProperty(next, 'remoteMethod')
      }
    }
  }

  return next
}

/** 解析整份 search[]，供 GrowSearchBar 直接消费 */
export const resolveSearchBarFields = (
  fields: SearchBarFieldLike[] | undefined | null,
  state: Record<string, unknown> = {},
  options: ResolveSearchBarFieldsOptions = {},
): SearchBarFieldLike[] => {
  if (!Array.isArray(fields)) return []
  return fields.map((field) => resolveSearchBarField(field, state, options))
}
