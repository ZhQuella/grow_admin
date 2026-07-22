/** 属性输入模式：普通文本 / 变量绑定 / 函数绑定 */

export type PropBindMode = 'text' | 'bind' | 'function'

/** uuid -> modelKey -> mode */
export type PropBindModesMap = Record<string, Record<string, PropBindMode>>

export const PROP_BIND_MODE_TEXT: PropBindMode = 'text'
export const PROP_BIND_MODE_BIND: PropBindMode = 'bind'
export const PROP_BIND_MODE_FUNCTION: PropBindMode = 'function'

export const normalizePropBindMode = (mode?: string | null): PropBindMode => {
  if (mode === PROP_BIND_MODE_BIND) return PROP_BIND_MODE_BIND
  if (mode === PROP_BIND_MODE_FUNCTION) return PROP_BIND_MODE_FUNCTION
  return PROP_BIND_MODE_TEXT
}

export const isFunctionBindMode = (mode?: string | null) =>
  normalizePropBindMode(mode) === PROP_BIND_MODE_FUNCTION
